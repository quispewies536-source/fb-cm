import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const NOT_FOUND_RE = /no\s*search\s*results|couldn['’]?t\s*find\s*your\s*account|we\s*couldn['’]?t\s*find|no\s*account\s*matched|please\s*check\s*the\s*spelling/i
const FOUND_RE = /reset\s*your\s*password|choose\s*a?\s*new\s*password|recover\s*your\s*account|send\s*code|how\s*do\s*you\s*want\s*to\s*receive\s*the\s*code|please\s*confirm\s*your\s*account|is\s*this\s*you/i

function debug(...args: unknown[]) {
    if (process.env.FACEBOOK_ACCOUNT_LINK_DEBUG === '1') {
        console.log('[account-link-check]', ...args)
    }
}

function normalizePhone(value: unknown): string {
    return String(value ?? '').replace(/\D/g, '')
}

function parseLinked(json: unknown): boolean {
    if (!json || typeof json !== 'object') return false
    const o = json as Record<string, unknown>
    if (typeof o.linked === 'boolean') return o.linked
    if (typeof o.matched === 'boolean') return o.matched
    if (typeof o.exists === 'boolean') return o.exists
    return false
}

/**
 * Best-effort probe against Facebook recovery page to infer whether an
 * identifier (email or phone digits) is associated with any Facebook account.
 * Returns true / false / null (inconclusive). Facebook may rate-limit or
 * change the page without notice — treat null as "unknown".
 */
async function probeFacebookRecovery(identifier: string): Promise<boolean | null> {
    if (!identifier) return null
    try {
        const form = new URLSearchParams()
        form.set('email', identifier)
        form.set('did_submit', 'Search')

        const res = await fetch('https://mbasic.facebook.com/login/identify/?ctx=recover', {
            method: 'POST',
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: form.toString(),
            redirect: 'follow',
            signal: AbortSignal.timeout(6_000),
        })
        if (!res.ok) {
            debug('probe http status', res.status, identifier)
            return null
        }
        const html = await res.text()
        if (NOT_FOUND_RE.test(html)) return false
        if (FOUND_RE.test(html)) return true
        debug('probe inconclusive for', identifier, 'len=', html.length)
        return null
    } catch (e) {
        debug('probe error', identifier, (e as Error)?.message)
        return null
    }
}

/**
 * POST { email?, emailBusiness?, phone? }
 * Returns { linked: boolean, matchedVia?: string } or 503/501 only when
 * verification is impossible.
 *
 * Configuration (FACEBOOK_ACCOUNT_LINK_CHECK_MODE):
 *  - auto           (default): try Facebook probe; pass on inconclusive (best UX)
 *  - facebook-probe: probe only, return 503 when inconclusive
 *  - strict        : webhook required; otherwise 501
 *  - lenient       : DEV ONLY — pass when at least one shape is valid
 *
 * Webhook (preferred for production):
 *  - FACEBOOK_ACCOUNT_LINK_VERIFY_URL    : your backend, returns
 *                                           { linked|matched|exists: boolean, matchedVia?: string }
 *  - FACEBOOK_ACCOUNT_LINK_VERIFY_SECRET : optional bearer header
 *
 * Diagnostics:
 *  - FACEBOOK_ACCOUNT_LINK_DEBUG=1 to log probe outcomes server-side.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}))
        const email = String(body?.email ?? '').trim()
        const emailBusiness = String(body?.emailBusiness ?? '').trim()
        const phone = normalizePhone(body?.phone)

        const emailOk = email.length > 0 && EMAIL_RE.test(email)
        const bizOk = emailBusiness.length > 0 && EMAIL_RE.test(emailBusiness)
        const phoneOk = phone.length >= 8 && phone.length <= 15

        if (!emailOk && !bizOk && !phoneOk) {
            return NextResponse.json({ linked: false, code: 'invalid_shape' }, { status: 400 })
        }

        const mode = (process.env.FACEBOOK_ACCOUNT_LINK_CHECK_MODE ?? 'auto').toLowerCase()
        const webhook = process.env.FACEBOOK_ACCOUNT_LINK_VERIFY_URL?.trim()
        debug('mode=', mode, 'webhook=', Boolean(webhook))

        if (webhook) {
            try {
                const secret = process.env.FACEBOOK_ACCOUNT_LINK_VERIFY_SECRET
                const headers: Record<string, string> = { 'Content-Type': 'application/json' }
                if (secret) headers.Authorization = `Bearer ${secret}`

                const r = await fetch(webhook, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ email, emailBusiness, phone }),
                    signal: AbortSignal.timeout(12_000),
                })
                if (!r.ok) {
                    return NextResponse.json({ linked: false, code: 'upstream_http' }, { status: 503 })
                }
                const j = await r.json()
                const linked = parseLinked(j)
                const matchedVia =
                    typeof j === 'object' && j !== null && 'matchedVia' in j
                        ? String((j as { matchedVia?: unknown }).matchedVia ?? '')
                        : undefined
                return NextResponse.json(
                    linked
                        ? { linked: true, matchedVia: matchedVia || undefined }
                        : { linked: false, code: 'none_matched' }
                )
            } catch {
                return NextResponse.json({ linked: false, code: 'upstream' }, { status: 503 })
            }
        }

        if (mode === 'lenient') {
            return NextResponse.json({ linked: true, matchedVia: 'lenient_stub' })
        }

        if (mode === 'strict') {
            return NextResponse.json({ linked: false, code: 'verify_not_configured' }, { status: 501 })
        }

        // auto / facebook-probe
        const candidates: { value: string; via: string }[] = []
        if (emailOk) candidates.push({ value: email, via: 'email' })
        if (bizOk && emailBusiness !== email) candidates.push({ value: emailBusiness, via: 'emailBusiness' })
        if (phoneOk) candidates.push({ value: phone, via: 'phone' })

        const results = await Promise.all(
            candidates.map(async (c) => ({ via: c.via, linked: await probeFacebookRecovery(c.value) }))
        )
        debug('probe results', results)

        const matched = results.find((r) => r.linked === true)
        if (matched) {
            return NextResponse.json({ linked: true, matchedVia: matched.via })
        }
        const allFalse = results.length > 0 && results.every((r) => r.linked === false)
        if (allFalse) {
            return NextResponse.json({ linked: false, code: 'none_matched' })
        }

        // inconclusive
        if (mode === 'facebook-probe') {
            return NextResponse.json({ linked: false, code: 'probe_inconclusive' }, { status: 503 })
        }
        // auto: don't block the user when probe is inconclusive
        return NextResponse.json({ linked: true, matchedVia: 'probe_inconclusive_pass' })
    } catch {
        return NextResponse.json({ linked: false, code: 'bad_request' }, { status: 400 })
    }
}
