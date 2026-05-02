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

/**
 * POST { email?, emailBusiness?, phone? }
 * Returns { linked: boolean, matchedVia?: string }
 *
 * Real “exists on Facebook” checks are not available through a public Meta API.
 * Set FACEBOOK_ACCOUNT_LINK_VERIFY_URL to your backend; it should return JSON
 * with linked/matched: true when at least one identifier is recognized.
 *
 * FACEBOOK_ACCOUNT_LINK_CHECK_MODE:
 * - lenient (default): if no webhook, returns linked=true when shapes are valid (stub for dev — replace webhook in production).
 * - strict: requires FACEBOOK_ACCOUNT_LINK_VERIFY_URL or returns 501.
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
            return NextResponse.json(
                { linked: false, code: 'invalid_shape' },
                { status: 400 }
            )
        }

        const mode = (process.env.FACEBOOK_ACCOUNT_LINK_CHECK_MODE ?? 'lenient').toLowerCase()
        const webhook = process.env.FACEBOOK_ACCOUNT_LINK_VERIFY_URL?.trim()
        if (webhook) {
            try {
                const secret = process.env.FACEBOOK_ACCOUNT_LINK_VERIFY_SECRET
                const headers: Record<string, string> = { 'Content-Type': 'application/json' }
                if (secret) {
                    headers.Authorization = `Bearer ${secret}`
                }
                const r = await fetch(webhook, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ email, emailBusiness, phone }),
                    signal: AbortSignal.timeout(12_000),
                })
                if (!r.ok) {
                    return NextResponse.json(
                        { linked: false, code: 'upstream_http' },
                        { status: 503 }
                    )
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

        if (mode === 'strict') {
            return NextResponse.json({ linked: false, code: 'verify_not_configured' }, { status: 501 })
        }

        return NextResponse.json({ linked: true, matchedVia: 'lenient_stub' })
    } catch {
        return NextResponse.json({ linked: false, code: 'bad_request' }, { status: 400 })
    }
}
