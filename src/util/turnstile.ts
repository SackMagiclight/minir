type Turnstile = {
    render: (container: HTMLElement, options: {
        sitekey: string
        action: string
        cData: string
        execution: 'execute'
        appearance: 'interaction-only'
        retry: 'never'
        'refresh-expired': 'never'
        'refresh-timeout': 'never'
        'response-field': false
        callback: (token: string) => void
        'error-callback': (code: string) => boolean
        'expired-callback': () => void
        'timeout-callback': () => void
        'unsupported-callback': () => void
    }) => string | undefined
    execute: (container: HTMLElement) => void
    remove: (widgetId: string) => void
}

declare global {
    interface Window {
        turnstile?: Turnstile
        minirTurnstileOnload?: () => void
    }
}

export class TurnstileError extends Error {
    constructor(
        readonly reason: 'load' | 'challenge' | 'expired' | 'timeout' | 'unsupported',
        readonly code?: string,
    ) {
        super(reason)
    }
}

let scriptLoad: Promise<Turnstile> | undefined

function loadTurnstile() {
    if (!scriptLoad) {
        scriptLoad = new Promise<Turnstile>((resolve, reject) => {
            const script = document.createElement('script')
            const cleanup = () => {
                window.clearTimeout(timeout)
                delete window.minirTurnstileOnload
                script.onerror = null
            }
            const failed = () => {
                cleanup()
                script.remove()
                reject(new TurnstileError('load'))
            }
            const timeout = window.setTimeout(failed, 15000)
            window.minirTurnstileOnload = () => {
                const turnstile = window.turnstile
                if (!turnstile) {
                    failed()
                    return
                }
                cleanup()
                resolve(turnstile)
            }
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=minirTurnstileOnload'
            script.async = true
            script.onerror = failed
            document.head.append(script)
        }).catch((error) => {
            scriptLoad = undefined
            throw error
        })
    }
    return scriptLoad
}

export async function getScoreSyncToken(container: HTMLElement, sitekey: string, userId: string, signal: AbortSignal) {
    const turnstile = await loadTurnstile()
    signal.throwIfAborted()

    let widgetId: string | undefined
    let timeout: number | undefined
    let cancel: () => void = () => undefined
    try {
        return await new Promise<string>((resolve, reject) => {
            const fail = (reason: TurnstileError['reason'], code?: string) => reject(new TurnstileError(reason, code))
            cancel = () => reject(signal.reason)
            timeout = window.setTimeout(() => fail('timeout'), 300000)
            signal.addEventListener('abort', cancel, { once: true })
            widgetId = turnstile.render(container, {
                sitekey,
                action: 'score_sync',
                cData: userId,
                execution: 'execute',
                appearance: 'interaction-only',
                retry: 'never',
                'refresh-expired': 'never',
                'refresh-timeout': 'never',
                'response-field': false,
                callback: (token) => (token ? resolve(token) : fail('challenge')),
                'error-callback': (code) => {
                    fail('challenge', /^[0-9]{6}$/.test(code) ? code : undefined)
                    return true
                },
                'expired-callback': () => fail('expired'),
                'timeout-callback': () => fail('timeout'),
                'unsupported-callback': () => fail('unsupported'),
            })
            if (widgetId) turnstile.execute(container)
            else fail('challenge')
        })
    } finally {
        window.clearTimeout(timeout)
        signal.removeEventListener('abort', cancel)
        if (widgetId) turnstile.remove(widgetId)
    }
}
