import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    Box,
    Flex,
    Grid,
    Heading,
    HStack,
    Spinner,
    Text,
    Tooltip,
    VStack,
} from '@chakra-ui/react'
import { getTokens, setAccessToken, setRefreshToken } from '~/store/userStore'
import { usePostHabitStatsMutation } from '~/api'

// ──────────────────────────────────────
// 定数・ユーティリティ
// ──────────────────────────────────────

const WEEKDAY_LABEL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const HEATMAP_COLORS = [
    'var(--chakra-colors-gray-200)',    // 0 plays
    'var(--chakra-colors-teal-100)',    // low
    'var(--chakra-colors-teal-300)',    // mid-low
    'var(--chakra-colors-teal-500)',    // mid-high
    'var(--chakra-colors-teal-700)',    // high
]

function getHeatmapColor(count: number, max: number): string {
    if (count === 0 || max === 0) return HEATMAP_COLORS[0]
    const ratio = count / max
    if (ratio < 0.2) return HEATMAP_COLORS[1]
    if (ratio < 0.4) return HEATMAP_COLORS[2]
    if (ratio < 0.7) return HEATMAP_COLORS[3]
    return HEATMAP_COLORS[4]
}

/** ローカルタイムゾーンで "YYYY-MM-DD" を返す */
function formatLocalDate(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

/** 過去53週分のグリッドデータを生成（今週の日曜から52週前の日曜まで） */
function buildHeatmapGrid(heatmap: Record<string, number>) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 今週の日曜日を起点に52週前の日曜日を求める
    const dayOfWeek = today.getDay()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - dayOfWeek - 52 * 7)

    const weeks: Array<Array<{ key: string; count: number; isFuture: boolean }>> = []
    const d = new Date(startDate)

    while (d <= today) {
        const week: typeof weeks[0] = []
        for (let dow = 0; dow < 7; dow++) {
            const key = formatLocalDate(d)
            week.push({ key, count: heatmap[key] ?? 0, isFuture: d > today })
            d.setDate(d.getDate() + 1)
        }
        weeks.push(week)
    }

    return weeks
}

// ──────────────────────────────────────
// サブコンポーネント
// ──────────────────────────────────────

function StreakBanner({
    streak,
    lastPlayDate,
}: {
    streak: number
    lastPlayDate: string
}) {
    const today = formatLocalDate(new Date())
    const yesterdayDate = new Date()
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const yesterday = formatLocalDate(yesterdayDate)

    let icon = '🔥'
    let message = `${streak}-day streak! / ${streak}日連続プレイ中！`
    let color = 'teal.500'

    if (lastPlayDate === yesterday) {
        icon = '⚠️'
        message = "Play today to keep your streak! / 今日プレイしないとストリークが途切れます"
        color = 'orange.400'
    } else if (lastPlayDate !== today && lastPlayDate !== yesterday) {
        icon = '💤'
        message = `Streak lost (last: ${lastPlayDate}) / ストリーク途切れ中`
        color = 'gray.400'
    }

    return (
        <HStack
            borderWidth={1}
            borderRadius="md"
            px={4}
            py={3}
            borderColor={color}
            spacing={3}
        >
            <Text fontSize="2xl">{icon}</Text>
            <VStack align="start" spacing={0}>
                <Text fontWeight="bold" color={color} fontSize="lg">
                    {streak} days
                </Text>
                <Text fontSize="sm" color="gray.500">
                    {message}
                </Text>
            </VStack>
        </HStack>
    )
}

function Heatmap({ heatmap }: { heatmap: Record<string, number> }) {
    const weeks = useMemo(() => buildHeatmapGrid(heatmap), [heatmap])
    const max = useMemo(
        () => Math.max(...Object.values(heatmap), 1),
        [heatmap],
    )

    return (
        <Box overflowX="auto" pb={1}>
            <Flex gap="2px">
                {weeks.map((week, wi) => (
                    <Flex key={wi} direction="column" gap="2px">
                        {week.map((cell) => (
                            <Tooltip
                                key={cell.key}
                                label={`${cell.key}: ${cell.count} plays`}
                                hasArrow
                                openDelay={200}
                            >
                                <Box
                                    w="11px"
                                    h="11px"
                                    borderRadius="2px"
                                    bg={
                                        cell.isFuture
                                            ? 'transparent'
                                            : getHeatmapColor(cell.count, max)
                                    }
                                    cursor="default"
                                />
                            </Tooltip>
                        ))}
                    </Flex>
                ))}
            </Flex>
            {/* 凡例 / Legend */}
            <HStack mt={2} spacing={1} justify="flex-end">
                <Text fontSize="xs" color="gray.500">
                    Less
                </Text>
                {HEATMAP_COLORS.map((c, i) => (
                    <Box key={i} w="11px" h="11px" borderRadius="2px" bg={c} />
                ))}
                <Text fontSize="xs" color="gray.500">
                    More
                </Text>
            </HStack>
        </Box>
    )
}

function BarChart({
    data,
    title,
}: {
    data: { label: string; plays: number; exSum: number }[]
    title: string
}) {
    const maxPlays = Math.max(...data.map((d) => d.plays), 1)

    return (
        <Box>
            <Text fontWeight="semibold" mb={2} fontSize="sm">
                {title}
            </Text>
            <VStack align="stretch" spacing={1}>
                {data.map((d) => (
                    <HStack key={d.label} spacing={2}>
                        <Text fontSize="xs" w="3rem" textAlign="right" flexShrink={0} color="gray.500">
                            {d.label}
                        </Text>
                        <Tooltip
                            label={`Plays: ${d.plays.toLocaleString()}  Total EX: ${d.exSum.toLocaleString()}`}
                            hasArrow
                        >
                            <Box
                                h="14px"
                                w={`${(d.plays / maxPlays) * 100}%`}
                                minW={d.plays > 0 ? '2px' : '0'}
                                bg="teal.400"
                                borderRadius="sm"
                                transition="width 0.3s"
                            />
                        </Tooltip>
                        <Text fontSize="xs" color="gray.500" flexShrink={0}>
                            {d.plays > 0 ? d.plays.toLocaleString() : '-'}
                        </Text>
                    </HStack>
                ))}
            </VStack>
        </Box>
    )
}

// ──────────────────────────────────────
// メインコンポーネント
// ──────────────────────────────────────

export default function UserStatsComponent() {
    const tokens = useSelector(getTokens)
    const dispatch = useDispatch()

    const [fetchHabitStats, { data, isLoading }] = usePostHabitStatsMutation()

    useEffect(() => {
        if (!tokens.accessToken || !tokens.refreshToken) return
        fetchHabitStats({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        })
    }, [tokens.accessToken, tokens.refreshToken])

    // トークン更新
    useEffect(() => {
        if (data?.accessToken) dispatch(setAccessToken(data.accessToken))
        if (data?.refreshToken) dispatch(setRefreshToken(data.refreshToken))
    }, [data])

    // ──── 派生データ計算 ────

    const weekdayData = useMemo(() => {
        if (!data?.stats?.weekday_stats) return []
        return WEEKDAY_LABEL.map((label, i) => {
            const v = data.stats!.weekday_stats[String(i)]
            return {
                label,
                plays: v?.plays ?? 0,
                exSum: v?.ex_sum ?? 0,
            }
        })
    }, [data])

    const hourData = useMemo(() => {
        if (!data?.stats?.hour_stats) return []
        return Array.from({ length: 24 }, (_, h) => {
            const v = data.stats!.hour_stats[String(h)]
            return {
                label: `${h}h`,
                plays: v?.plays ?? 0,
                exSum: v?.ex_sum ?? 0,
            }
        }).filter((d) => d.plays > 0)
    }, [data])

    // ──── レンダリング ────

    if (!tokens.accessToken || !tokens.refreshToken) return null

    if (isLoading) {
        return (
            <Box p={4} w="100%">
                <Spinner size="sm" color="teal.400" />
            </Box>
        )
    }

    if (!data?.stats) {
        return (
            <Box p={4} w="100%">
                <Text color="gray.400" fontSize="sm">
                    No play data yet / プレイデータがまだありません
                </Text>
            </Box>
        )
    }

    const { stats } = data

    return (
        <Box w="100%" p={4}>
            <Heading size="md" mb={4}>
                Play Habits / プレイ習慣
            </Heading>

            <VStack align="stretch" spacing={6}>
                {/* ストリーク */}
                <StreakBanner
                    streak={stats.play_streak}
                    lastPlayDate={stats.last_play_date}
                />

                {/* ヒートマップ / Heatmap */}
                <Box>
                    <Text fontWeight="semibold" mb={2} fontSize="sm">
                        Play History (Past Year / 過去1年)
                    </Text>
                    <Heatmap heatmap={stats.daily_heatmap} />
                </Box>

                {/* 曜日・時間帯チャート */}
                <Grid
                    templateColumns={{ base: '1fr', md: '1fr 1fr' }}
                    gap={6}
                >
                    <BarChart
                        data={weekdayData}
                        title="Plays by Day / 曜日別プレイ回数"
                    />
                    <BarChart
                        data={hourData}
                        title="Plays by Hour / 時間帯別プレイ回数"
                    />
                </Grid>
            </VStack>
        </Box>
    )
}
