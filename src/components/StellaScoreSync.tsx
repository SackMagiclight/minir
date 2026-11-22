import { Box, Button, Text, useToast } from '@chakra-ui/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { reset } from '../store/userStore'
import { getScoreSyncToken, TurnstileError } from '../util/turnstile'

const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim()

const retryMessage = '再送に失敗しました。時間を置いて、もう一度「Stella に再送」を押してください。'
const challengeRetry = 'セキュリティ確認に失敗しました。もう一度「Stella に再送」を押してください。'
const challengeErrors: Record<TurnstileError['reason'], string> = {
    load: 'セキュリティ確認を読み込めませんでした。接続を確認してから、もう一度お試しください。',
    challenge: challengeRetry,
    expired: 'セキュリティ確認の有効期限が切れました。もう一度「Stella に再送」を押してください。',
    timeout: 'セキュリティ確認がタイムアウトしました。もう一度「Stella に再送」を押してください。',
    unsupported: 'このブラウザーではセキュリティ確認を実行できません。別のブラウザーでお試しください。',
}
const errorMessages: Partial<Record<number, string>> = {
    401: 'セッションの有効期限が切れました。ログインし直してから再送してください。',
    403: 'セキュリティ確認に失敗したか、リクエストがブロックされました。',
    404: '選択中の LN モードに保存された本人のスコアが見つかりません。',
    409: 'Stella が未連携か、このスコアは再送できません。',
    429: retryMessage,
    502: retryMessage,
    503: retryMessage,
}

function getChallengeErrorMessage(error: unknown) {
    if (!(error instanceof TurnstileError)) return challengeRetry
    if (error.code === '110200') {
        return `このホストはセキュリティ確認の許可対象外です（${window.location.hostname}、Turnstile 110200）。`
    }
    const message = challengeErrors[error.reason]
    return error.code ? `${message}（Turnstile ${error.code}）` : message
}

async function sendScore(songhash: string, accessToken: string, turnstileToken: string, signal: AbortSignal) {
    const body = JSON.stringify({ songhash, accessToken, turnstileToken })
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body))
    const bodyHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')

    signal.throwIfAborted()
    const response = await fetch('https://dqv8b9eb8y6nl.cloudfront.net/song/score/sync', {
        method: 'POST',
        credentials: 'omit',
        redirect: 'error',
        headers: {
            'Content-Type': 'application/json',
            'x-amz-content-sha256': bodyHash,
        },
        body,
        signal,
    })

    if (response.status === 200) {
        const result = await response.json().catch(() => null)
        if (result?.service === 'Stella' && result?.status === 'sent') return 'sent'
    }
    return response.status
}

type Props = {
    songhash: string
    userId: string
    accessToken: string
}

export function StellaScoreSync({ songhash, userId, accessToken }: Props) {
    const toast = useToast()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const container = useRef<HTMLDivElement>(null)
    const attempt = useRef<AbortController>()
    const [isSending, setSending] = useState(false)

    useLayoutEffect(() => {
        setSending(false)
        return () => {
            attempt.current?.abort()
            attempt.current = undefined
        }
    }, [songhash, userId, accessToken])

    const resend = async () => {
        if (!siteKey || !container.current || attempt.current) return
        const controller = new AbortController()
        const { signal } = controller
        attempt.current = controller
        setSending(true)

        const showError = (description: string) => {
            toast({ description, status: 'error', isClosable: true })
        }

        try {
            let token: string
            try {
                token = await getScoreSyncToken(container.current, siteKey, userId, signal)
            } catch (error) {
                if (!signal.aborted) showError(getChallengeErrorMessage(error))
                return
            }
            if (signal.aborted) return

            const result = await sendScore(songhash, accessToken, token, signal)
            if (signal.aborted) return

            if (result === 'sent') {
                toast({ description: 'Stella に再送しました', status: 'success', isClosable: true })
                return
            }
            showError(errorMessages[result] ?? 'Stella への再送に失敗しました。')
            if (result === 401) {
                dispatch(reset())
                navigate('/login', { replace: true })
            }
        } catch {
            if (!signal.aborted) showError(retryMessage)
        } finally {
            if (attempt.current === controller) {
                attempt.current = undefined
                setSending(false)
            }
        }
    }

    return (
        <Box>
            <Button size="xs" colorScheme="teal" onClick={resend} isLoading={isSending} isDisabled={!siteKey}>
                Stella に再送
            </Button>
            {!siteKey && <Text fontSize="xs">Stella への再送は現在利用できません。</Text>}
            <Box ref={container} />
        </Box>
    )
}
