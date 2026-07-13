import { IMinIRUserEventEntity } from '~/entities'
import { Box, Flex, Grid, GridItem, Link, Text } from '@chakra-ui/react'
import dayjs from 'dayjs'
import { MdDoubleArrow } from 'react-icons/md'
import { clearStyle, getDJLevel } from '~/util/clearLampUtil'
import { useEffect, useMemo, useState } from 'react'
import { Link as ReactLink } from 'react-router-dom'

const clearStringValue = (clearText: string) => {
    switch (clearText) {
        case 'Easy':
            return 4
        case 'Normal':
            return 5
        case 'Hard':
            return 6
        case 'ExHard':
            return 7
        case 'FullCombo':
            return 8
        default:
            return 0
    }
}

export default ({ eventList }: { eventList: IMinIRUserEventEntity[] }) => {

    const getTableData = async () => {
        const result = await Promise.allSettled([
            fetch(`https://stellabms.xyz/sl/score.json`),
            fetch(`https://stellabms.xyz/st/score.json`),
            fetch(`https://raw.githubusercontent.com/MiraiScarlet/MiraiScarlet.github.io/refs/heads/main/bms/table/overjoy/data_overjoy.json`),
            fetch(`https://raw.githubusercontent.com/MiraiScarlet/MiraiScarlet.github.io/refs/heads/main/bms/table/genocide_insane/data_insane.json`),
            fetch(`https://raw.githubusercontent.com/MiraiScarlet/MiraiScarlet.github.io/refs/heads/main/bms/table/genocide_normal/data_normal.json`),
        ])

        return [
            {
                tableName: 'Sattelite',
                prefix: 'sl',
                data: result[0].status === 'fulfilled' ? await result[0].value.json() : []
            },
            {
                tableName: 'Stella',
                prefix: 'st',
                data: result[1].status === 'fulfilled' ? await result[1].value.json() : []
            },
            {
                tableName: 'Overjoy',
                prefix: '★★',
                data: result[2].status === 'fulfilled' ? await result[2].value.json() : []
            },
            {
                tableName: '発狂BMS',
                prefix: '★',
                data: result[3].status === 'fulfilled' ? await result[3].value.json() : []
            },
            {
                tableName: '通常難易度',
                prefix: '⭐︎',
                data: result[4].status === 'fulfilled' ? await result[4].value.json() : []
            }
        ]
    }

    const [tableData, setTableData] = useState<any[] | undefined>(undefined)
    useEffect(() => {
        (async () => {
            if (!tableData) {
                setTableData(await getTableData())
            }
        })()
    }, [])

    const tableComponent = (sha256: string, md5?: string) => {
        let targetData: any = undefined
        for (const data of tableData ?? []) {
            const _data = data.data.find((d: any) => d.sha256 === sha256 || (d.md5 && md5 && d.md5 === md5 ))
            if (_data) {
                targetData = {
                    ..._data,
                    tableName: data.tableName,
                    prefix: data.prefix
                }
                break
            }
        }
        if (!targetData) {
            return null
        }

        return (
            <Flex flexDirection={`column`} textAlign={`center`} py={0} px={1} alignItems={`end`}>
                <Text lineHeight={1} fontSize={`x-small`} fontFamily={`Anta`} textColor={`gray.700`}>{targetData.tableName}</Text>
                <Text lineHeight={1} fontFamily={`Anta`} textColor={`gray.700`}>{targetData.prefix}{targetData.level}</Text>
            </Flex>
        )
    }

    const updateScore = useMemo(() => {
        return eventList.filter((event) => event.eventType === 'score')
    }, [eventList])
    const updateScoreComponent = () => {
        return updateScore.length ? (
            <Box>
                <Text fontSize="xs" fontWeight="700" color="gray.400" letterSpacing="0.08em" textTransform="uppercase" mb={3}>Score</Text>
                <Flex flexDirection="column" gap={2}>
                    {updateScore.map((event) => {
                        const payload = JSON.parse(event.payload || '{}')
                        const DJLevelComponent = ({ score, notes }: { score: number, notes: number }) => {
                            const { level, distance } = getDJLevel(score, notes)
                            return (
                                <Flex
                                    rounded="md"
                                    border="1px solid"
                                    borderColor="blue.200"
                                    bg="blue.50"
                                    textAlign="center"
                                    py={0.5}
                                    px={2}
                                    alignItems="baseline"
                                    gap={0.5}
                                >
                                    <Text fontSize="xs" fontWeight="700" color="blue.600" fontFamily={`"Press Start 2P"`}>{level}</Text>
                                    <Text fontSize="2xs" color="gray.500" fontFamily={`"Press Start 2P"`}>+{distance}</Text>
                                </Flex>
                            )
                        }

                        return (
                            <Box
                                key={event.uuid}
                                bg="white"
                                border="1px solid"
                                borderColor="gray.100"
                                borderRadius="xl"
                                p={3}
                                _hover={{ borderColor: 'gray.200', shadow: 'sm' }}
                                transition="all 0.15s"
                            >
                                <Flex justifyContent="space-between" alignItems="center" mb={1}>
                                    <Text fontSize="2xs" fontWeight="600" color="gray.400" fontFamily="Anta" letterSpacing="0.06em">{payload.song.notes} NOTES</Text>
                                    <Text fontSize="2xs" color="gray.400">{dayjs(event.timestamp).format('HH:mm:ss')}</Text>
                                </Flex>
                                <Text fontSize="sm" fontWeight="600" fontFamily="Oswald" color="gray.800" mb={2} lineHeight={1.3}>
                                    <Link as={ReactLink} to={`/viewer/song/${payload.song.sha256}/${payload.song.lnmode}/score/${event.userId}`} _hover={{ color: 'teal.600' }}>
                                        {payload.song.title}
                                    </Link>
                                </Text>
                                <Flex justifyContent="space-between" alignItems="center">
                                    <Flex alignItems="center" gap={1}>
                                        <Text fontSize="xs" color="gray.500" fontFamily="Orbitron">{event.beforeValue ?? 'No Score'}</Text>
                                        <Box as={MdDoubleArrow} fontSize="14px" color="gray.400" />
                                        <Text fontSize="lg" fontWeight="700" fontFamily="Orbitron" color="red.500" lineHeight={1}>{event.afterValue}</Text>
                                        {event.beforeValue && (
                                            <Text fontSize="xs" color="gray.500" fontFamily="Orbitron">(+{Number(event.afterValue) - Number(event.beforeValue)})</Text>
                                        )}
                                    </Flex>
                                    <Flex gap={1} alignItems="end">
                                        {DJLevelComponent({ score: Number(event.afterValue), notes: payload.song.notes })}
                                        {tableComponent(payload.song.sha256)}
                                    </Flex>
                                </Flex>
                            </Box>)
                    })}
                </Flex>
            </Box>
        ) : null
    }

    const updateClearLamp = useMemo(() => {
        return eventList.filter((event) => event.eventType === 'clear')
    }, [eventList])
    const updateClearLampComponent = () => {
        return updateClearLamp.length ? (
            <Box>
                <Text fontSize="xs" fontWeight="700" color="gray.400" letterSpacing="0.08em" textTransform="uppercase" mb={3}>Clear Lamp</Text>
                <Flex flexDirection="column" gap={2}>
                    {updateClearLamp.map((event) => {
                        const payload = JSON.parse(event.payload || '{}')
                        const beforeValue = event.beforeValue ? clearStyle(Number(event.beforeValue)) : undefined
                        const afterValue = clearStyle(Number(event.afterValue))
                        const LampBadge = ({ style, label }: { style: ReturnType<typeof clearStyle> | undefined, label: string }) => (
                            <Text
                                fontSize="xs"
                                fontFamily="Orbitron"
                                px={2.5}
                                py={1}
                                borderRadius="md"
                                fontWeight={700}
                                textAlign="center"
                                bg={style?.backgroundColor ?? 'gray.100'}
                                color={style ? 'white' : 'gray.500'}
                                minW="80px"
                            >
                                {label}
                            </Text>
                        )
                        if (!!payload.song) {
                            return (
                                <Box
                                    key={event.uuid}
                                    bg="white"
                                    border="1px solid"
                                    borderColor="gray.100"
                                    borderRadius="xl"
                                    p={3}
                                    _hover={{ borderColor: 'gray.200', shadow: 'sm' }}
                                    transition="all 0.15s"
                                >
                                    <Flex justifyContent="space-between" alignItems="center" mb={1}>
                                        <Text fontSize="2xs" fontWeight="600" color="gray.400" fontFamily="Anta" letterSpacing="0.06em">{payload.song.notes} NOTES</Text>
                                        <Text fontSize="2xs" color="gray.400">{dayjs(event.timestamp).format('HH:mm:ss')}</Text>
                                    </Flex>
                                    <Text fontSize="sm" fontWeight="600" fontFamily="Oswald" color="gray.800" mb={2} lineHeight={1.3}>
                                        <Link as={ReactLink} to={`/viewer/song/${payload.song.sha256}/${payload.song.lnmode}/score/${event.userId}`} _hover={{ color: 'teal.600' }}>
                                            {payload.song.title}
                                        </Link>
                                    </Text>
                                    <Flex justifyContent="space-between" alignItems="center">
                                        <Flex alignItems="center" gap={1.5}>
                                            <LampBadge style={beforeValue} label={beforeValue ? beforeValue.text : 'No Play'} />
                                            <Box as={MdDoubleArrow} fontSize="14px" color="gray.400" />
                                            <LampBadge style={afterValue} label={afterValue.text} />
                                        </Flex>
                                        {tableComponent(payload.song.sha256)}
                                    </Flex>
                                </Box>
                            )
                        } else if (!!payload.cource) {
                            return (
                                <Box
                                    key={event.uuid}
                                    bg="white"
                                    border="1px solid"
                                    borderColor="gray.100"
                                    borderRadius="xl"
                                    p={3}
                                    _hover={{ borderColor: 'gray.200', shadow: 'sm' }}
                                    transition="all 0.15s"
                                >
                                    <Flex justifyContent="space-between" alignItems="center" mb={1}>
                                        <Text fontSize="2xs" color="gray.400">-</Text>
                                        <Text fontSize="2xs" color="gray.400">{dayjs(event.timestamp).format('HH:mm:ss')}</Text>
                                    </Flex>
                                    <Text fontSize="sm" fontWeight="600" fontFamily="Oswald" color="gray.800" mb={2}>
                                        {payload.cource.name}
                                    </Text>
                                    <Flex alignItems="center" gap={1.5}>
                                        <LampBadge style={beforeValue} label={beforeValue ? beforeValue.text : 'No Play'} />
                                        <Box as={MdDoubleArrow} fontSize="14px" color="gray.400" />
                                        <LampBadge style={afterValue} label={afterValue.text} />
                                    </Flex>
                                </Box>
                            )
                        }
                    })}
                </Flex>
            </Box>
        ) : null
    }

    const updateBpLamp = useMemo(() => {
        return eventList.filter((event) => event.eventType === 'bp')
    }, [eventList])
    const updateBpComponent = () => {
        return updateBpLamp.length ? (
            <Box>
                <Text fontSize="xs" fontWeight="700" color="gray.400" letterSpacing="0.08em" textTransform="uppercase" mb={3}>BP Count</Text>
                <Flex flexDirection="column" gap={2}>
                    {updateBpLamp.map((event) => {
                        const payload = JSON.parse(event.payload || '{}')
                        if (!!payload.song) {
                            return (
                                <Box
                                    key={event.uuid}
                                    bg="white"
                                    border="1px solid"
                                    borderColor="gray.100"
                                    borderRadius="xl"
                                    p={3}
                                    _hover={{ borderColor: 'gray.200', shadow: 'sm' }}
                                    transition="all 0.15s"
                                >
                                    <Flex justifyContent="space-between" alignItems="center" mb={1}>
                                        <Text fontSize="2xs" fontWeight="600" color="gray.400" fontFamily="Anta" letterSpacing="0.06em">{payload.song.notes} NOTES</Text>
                                        <Text fontSize="2xs" color="gray.400">{dayjs(event.timestamp).format('HH:mm:ss')}</Text>
                                    </Flex>
                                    <Text fontSize="sm" fontWeight="600" fontFamily="Oswald" color="gray.800" mb={2} lineHeight={1.3}>
                                        <Link as={ReactLink} to={`/viewer/song/${payload.song.sha256}/${payload.song.lnmode}/score/${event.userId}`} _hover={{ color: 'teal.600' }}>
                                            {payload.song.title}
                                        </Link>
                                    </Text>
                                    <Flex justifyContent="space-between" alignItems="center">
                                        <Flex alignItems="center" gap={1}>
                                            <Text fontSize="xs" color="gray.500" fontFamily="Orbitron">{event.beforeValue ?? '-'}</Text>
                                            <Box as={MdDoubleArrow} fontSize="14px" color="gray.400" />
                                            <Text fontSize="lg" fontWeight="700" fontFamily="Orbitron" color="blue.500" lineHeight={1}>{event.afterValue}</Text>
                                            {event.beforeValue && (
                                                <Text fontSize="xs" color="gray.500" fontFamily="Orbitron">(-{Number(event.beforeValue) - Number(event.afterValue)})</Text>
                                            )}
                                        </Flex>
                                        {tableComponent(payload.song.sha256)}
                                    </Flex>
                                </Box>
                            )
                        }
                    })}
                </Flex>
            </Box>
        ) : null
    }

    const lampGroup = useMemo(() => {
        // 同じ曲・コースは最高ランプのイベントのみ残す
        const highestLampMap = new Map<string, IMinIRUserEventEntity>()
        for (const event of updateClearLamp) {
            const payload = JSON.parse(event.payload || '{}')
            const key = payload.song?.sha256 ?? payload.cource?.name
            if (!key) continue
            const existing = highestLampMap.get(key)
            if (!existing || Number(event.afterValue) > Number(existing.afterValue)) {
                highestLampMap.set(key, event)
            }
        }

        return Array.from(highestLampMap.values()).reduce((acc, event) => {
            switch (Number(event.afterValue)) {
                case 4:
                    acc['Easy'].push(event)
                    break
                case 5:
                    acc['Normal'].push(event)
                    break
                case 6:
                    acc[`Hard`].push(event)
                    break
                case 7:
                    acc[`ExHard`].push(event)
                    break
                case 8:
                case 9:
                case 10:
                    acc[`FullCombo`].push(event)
                    break
                default:
                    break
            }
            return acc
        }, {
            'Easy': [], 'Normal': [], 'Hard': [], 'ExHard': [], 'FullCombo': [],
        } as { [key: string]: IMinIRUserEventEntity[] })
    }, [updateClearLamp])
    const newLampComponent = () => {
        return (
            <Box>
                <Text fontSize="xs" fontWeight="700" color="gray.400" letterSpacing="0.08em" textTransform="uppercase" mb={3}>New Clear Lamp</Text>
                <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} gap={2}>
                    {Object.keys(lampGroup).map((key) => {
                        const events = lampGroup[key]
                        const clearNumber = clearStringValue(key)
                        const clearStl = clearStyle(clearNumber)
                        return (
                            <GridItem
                                key={key}
                                borderRadius="xl"
                                overflow="hidden"
                                border="1px solid"
                                borderColor="gray.100"
                            >
                                {/* ランプカラーのアクセント帯 */}
                                <Box h="4px" bg={clearStl.backgroundColor} />
                                <Box p={3}>
                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        fontFamily="Orbitron"
                                        color="gray.700"
                                        textAlign="center"
                                        mb={2}
                                        letterSpacing="0.04em"
                                    >
                                        {key}
                                    </Text>
                                    {!events.length ? (
                                        <Text textAlign="center" fontSize="xs" color="gray.400" py={3}>No Record</Text>
                                    ) : (
                                        <Flex flexDirection="column" gap={1.5}>
                                            {events.map((event) => {
                                                const payload = JSON.parse(event.payload || '{}')
                                                if (!!payload.song) {
                                                    return (
                                                        <Box
                                                            key={event.uuid}
                                                            bg="gray.50"
                                                            borderRadius="lg"
                                                            px={2}
                                                            py={1.5}
                                                        >
                                                            <Flex justifyContent="space-between" alignItems="flex-start" gap={1}>
                                                                <Text fontSize="xs" fontWeight="600" fontFamily="Oswald" color="gray.800" lineHeight={1.3}>
                                                                    <Link as={ReactLink} to={`/viewer/song/${payload.song.sha256}/${payload.song.lnmode}/score/${event.userId}`} _hover={{ color: 'teal.600' }}>
                                                                        {payload.song.title}
                                                                    </Link>
                                                                </Text>
                                                                {tableComponent(payload.song.sha256)}
                                                            </Flex>
                                                        </Box>
                                                    )
                                                } else if (!!payload.cource) {
                                                    return (
                                                        <Box key={event.uuid} bg="gray.50" borderRadius="lg" px={2} py={1.5}>
                                                            <Text fontSize="xs" fontWeight="600" fontFamily="Oswald" color="gray.800">
                                                                {payload.cource.name}
                                                            </Text>
                                                        </Box>
                                                    )
                                                }
                                            })}
                                        </Flex>
                                    )}
                                </Box>
                            </GridItem>
                        )
                    })}
                </Grid>
            </Box>
        )
    }

    return (
        <Flex flexDirection="column" gap={6} w="100%">
            {newLampComponent()}
            <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }} gap={4}>
                <GridItem>
                    {updateScoreComponent()}
                </GridItem>
                <GridItem>
                    {updateClearLampComponent()}
                </GridItem>
                <GridItem>
                    {updateBpComponent()}
                </GridItem>
            </Grid>
        </Flex>
    )
}