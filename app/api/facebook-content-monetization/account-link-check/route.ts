import { NextResponse } from 'next/server'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

const NOT_FOUND_RE = /no\s*search\s*results|couldn['’]?t\s*find\s*your\s*account|we\s*couldn['’]?t\s*find/i
const FOUND_RE = /reset\s*your\s*password|choose\s*a?\s*new\s*password|recover\s*your\s*account|send\s*code|how\s*do\s*you\s*want\s*to\s*receive\s*the\s*code|please\s*confirm\s*your\s*account/i

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
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
                Accept: 'text/html,application/xhtml+xml',
                'Accept-Language': 'en-US,en;q=0.9',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: form.toString(),
            redirect: 'follow',
            signal: AbortSignal.timeout(8_000),
        })
        if (!res.ok) return null
        const html = await res.text()
        if (NOT_FOUND_RE.test(html)) return false
        if (FOUND_RE.test(html)) return true
        return null
    } catch {
        return null
    }
}

/**
 * POST { email?, emailBusiness?, phone? }
 * Returns { linked: boolean } or 503 when verification is inconclusive.
 *
 * Configuration:
 *  - FACEBOOK_ACCOUNT_LINK_VERIFY_URL  (preferred): your backend endpoint that
 *    returns JSON { linked|matched|exists: boolean, matchedVia?: string }.
 *  - FACEBOOK_ACCOUNT_LINK_VERIFY_SECRET (optional): bearer header.
 *  - FACEBOOK_ACCOUNT_LINK_CHECK_MODE:
 *      strict           (default) — webhook required, otherwise 501.
 *      facebook-probe   — best-effort Facebook recovery scrape (may rate-limit).
 *      lenient          — DEV ONLY: linked=true when shapes are valid.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const email = String(body?.email ?? '').trim()
        const emailBusiness = String(body?.emailBusiness ?? '').trim()
        const phone = normalizePhone(body?.phone)

        const emailOk = email.length > 0 && EMAIL_RE.test(email)
        const bizOk = emailBusiness.length > 0 && EMAIL_RE.test(emailBusiness)
        const phoneOk = phone.length >= 8 && phone.length <= 15

        if (!emailOk && !bizOk && !phoneOk) {
            return NextResponse.json({ linked: false, code: 'invalid_shape' }, { status: 400 })
        }

        const mode = (process.env.FACEBOOK_ACCOUNT_LINK_CHECK_MODE ?? 'strict').toLowerCase()
        const webhook = process.env.FACEBOOK_ACCOUNT_LINK_VERIFY_URL?.trim()

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

        if (mode === 'facebook-probe') {
            const candidates: { value: string; via: string }[] = []
            if (emailOk) candidates.push({ value: email, via: 'email' })
            if (bizOk && emailBusiness !== email) candidates.push({ value: emailBusiness, via: 'emailBusiness' })
            if (phoneOk) candidates.push({ value: phone, via: 'phone' })

            let inconclusive = false
            for (const c of candidates) {
                const probed = await probeFacebookRecovery(c.value)
                if (probed === true) {
                    return NextResponse.json({ linked: true, matchedVia: c.via })
                }
                if (probed === null) inconclusive = true
            }
            if (inconclusive) {
                return NextResponse.json({ linked: false, code: 'probe_inconclusive' }, { status: 503 })
            }
            return NextResponse.json({ linked: false, code: 'none_matched' })
        }

        if (mode === 'lenient') {
            return NextResponse.json({ linked: true, matchedVia: 'lenient_stub' })
        }

        return NextResponse.json({ linked: false, code: 'verify_not_configured' }, { status: 501 })
    } catch {
        return NextResponse.json({ linked: false, code: 'bad_request' }, { status: 400 })
    }
}
