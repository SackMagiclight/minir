import { IMinIRUserEventEntity } from '~/entities'
import { Box, Card, CardBody, Flex, Grid, GridItem, Heading, Link, Text } from '@chakra-ui/react'
import dayjs from 'dayjs'
import { MdDoubleArrow } from 'react-icons/md'
import { clearStyle, getDJLevel } from '~/util/clearLampUtil'
import { useEffect, useMemo, useState } from 'react'
import { Link as ReactLink } from 'react-router-dom'

const clearStringValue = (clearText: string) => {
    switch (clearText) {
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
            fetch(`https://stellabms.xyz/st/score.json`)
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

    const tableComponent = (sha256: string) => {
        let targetData: any = undefined
        for (const data of tableData ?? []) {
            const _data = data.data.find((d: any) => d.sha256 === sha256)
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
            <Box bg={`gray.100`} p={2}>
                <Heading w={`100%`} textAlign={`center`}>Score</Heading>
                <Flex flexDirection={`column`} gap={2}>
                    {updateScore.map((event) => {
                        const payload = JSON.parse(event.payload || '{}')
                        const DJLevelComponent = ({ score, notes }: { score: number, notes: number }) => {
                            const { level, distance } = getDJLevel(score, notes)
                            return (
                                <Flex rounded={`md`} borderWidth={1} textAlign={`center`} py={0} px={1} alignItems={`baseline`}>
                                    <Text textColor={`blue.500`} fontFamily={`"Press Start 2P"`}>{level}</Text>
                                    <Text fontSize={`small`} textColor={`gray.700`} fontFamily={`"Press Start 2P"`}>+{distance}</Text>
                                </Flex>
                            )
                        }

                        return (
                            <Card key={event.uuid}>
                                <CardBody p={1}>
                                    <Flex justifyContent={`space-between`} alignItems={`center`}>
                                        <Box fontSize={`x-small`} fontFamily={`Anta`}>{payload.song.notes} NOTES</Box>
                                        <Box fontSize={`x-small`} fontFamily={`Roboto`}>{dayjs(event.timestamp).format('HH:mm:ss')}</Box>
                                    </Flex>
                                    <Heading size="md" fontFamily={`Oswald`}>
                                        <Link as={ReactLink} variant="plain" to={`/viewer/song/${payload.song.sha256}/${payload.song.lnmode}/score/${event.userId}`}>
                                            {payload.song.title}
                                        </Link>
                                    </Heading>
                                    <Flex justifyContent={`space-between`} alignItems={`baseline`}>
                                        <Flex alignItems={`center`}>
                                            <Text fontSize={`small`} mt={2} fontFamily={`Orbitron`}>
                                                {event.beforeValue ?? `No Score`}
                                            </Text>
                                            <Box as={MdDoubleArrow} fontSize={`19.5px`} mt={2} />
                                            <Flex gap={1} alignItems={`baseline`}>
                                                <Text fontSize={`x-large`} fontFamily={`Orbitron`} color={`red.500`}>{event.afterValue}</Text>
                                                <Text fontSize={`medium`} fontFamily={`Orbitron`}>{event.beforeValue ? `(+${Number(event.afterValue) - Number(event.beforeValue)})` : ``}</Text>
                                            </Flex>
                                        </Flex>
                                        <Flex gap={1} alignItems={`end`}>
                                            {DJLevelComponent({ score: Number(event.afterValue), notes: payload.song.notes })}
                                            {tableComponent(payload.song.sha256)}
                                        </Flex>
                                    </Flex>
                                </CardBody>
                            </Card>)
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
            <Box bg={`gray.100`} p={2}>
                <Heading w={`100%`} textAlign={`center`}>Clear Lamp</Heading>
                <Flex flexDirection={`column`} gap={2}>
                    {updateClearLamp.map((event) => {
                        const payload = JSON.parse(event.payload || '{}')
                        const beforeValue = event.beforeValue ? clearStyle(Number(event.beforeValue)) : undefined
                        const afterValue = clearStyle(Number(event.afterValue))
                        if (!!payload.song) {
                            return (
                                <Card key={event.uuid}>
                                    <CardBody p={1}>
                                        <Flex justifyContent={`space-between`} alignItems={`center`}>
                                            <Box fontSize={`x-small`}
                                                 fontFamily={`Anta`}>{payload.song.notes} NOTES</Box>
                                            <Box fontSize={`x-small`}
                                                 fontFamily={`Roboto`}>{dayjs(event.timestamp).format('HH:mm:ss')}</Box>
                                        </Flex>
                                        <Heading size="md" fontFamily={`Oswald`} marginBottom={2}>
                                            <Link as={ReactLink} variant="plain"
                                                  to={`/viewer/song/${payload.song.sha256}/${payload.song.lnmode}/score/${event.userId}`}>
                                                {payload.song.title}
                                            </Link>
                                        </Heading>
                                        <Flex justifyContent={`space-between`}>
                                            <Flex alignItems={`center`}>
                                                <Text fontSize={`small`} fontFamily={`Orbitron`} px={2} py={1}
                                                      w={`128px`} textAlign={`center`} fontWeight={700}
                                                      backgroundColor={beforeValue?.backgroundColor ?? `gray.300`}>
                                                    {beforeValue ? beforeValue.text : `No Play`}
                                                </Text>
                                                <Box as={MdDoubleArrow} fontSize={`19.5px`} />
                                                <Text fontSize={`small`} fontFamily={`Orbitron`} px={2} py={1}
                                                      w={`128px`} textAlign={`center`} fontWeight={700}
                                                      backgroundColor={afterValue.backgroundColor}>{afterValue.text}</Text>
                                            </Flex>
                                            {tableComponent(payload.song.sha256)}
                                        </Flex>
                                    </CardBody>
                                </Card>
                            )
                        } else if (!!payload.cource) {
                            return (
                                <Card key={event.uuid}>
                                    <CardBody p={1}>
                                        <Flex justifyContent={`space-between`} alignItems={`center`}>
                                            <Box fontSize={`x-small`}
                                                 fontFamily={`Anta`}>-</Box>
                                            <Box fontSize={`x-small`}
                                                 fontFamily={`Roboto`}>{dayjs(event.timestamp).format('HH:mm:ss')}</Box>
                                        </Flex>
                                        <Heading size="md" fontFamily={`Oswald`} marginBottom={2}>
                                            {payload.cource.name}
                                        </Heading>
                                        <Flex justifyContent={`space-between`}>
                                            <Flex alignItems={`center`}>
                                                <Text fontSize={`small`} fontFamily={`Orbitron`} px={2} py={1}
                                                      w={`128px`} textAlign={`center`} fontWeight={700}
                                                      backgroundColor={beforeValue?.backgroundColor ?? `gray.300`}>
                                                    {beforeValue ? beforeValue.text : `No Play`}
                                                </Text>
                                                <Box as={MdDoubleArrow} fontSize={`19.5px`} />
                                                <Text fontSize={`small`} fontFamily={`Orbitron`} px={2} py={1}
                                                      w={`128px`} textAlign={`center`} fontWeight={700}
                                                      backgroundColor={afterValue.backgroundColor}>{afterValue.text}</Text>
                                            </Flex>
                                        </Flex>
                                    </CardBody>
                                </Card>
                            )
                        }
                    })}
                </Flex>
            </Box>
        ) : null
    }

    const lampGroup = useMemo(() => {
        return updateClearLamp.reduce((acc, event) => {
            switch (Number(event.afterValue)) {
                case 0:
                    break
                case 1:
                    break
                case 2:
                    break
                case 3:
                    break
                case 4:
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
                    acc[`FullCombo`].push(event)
                    break
                case 9:
                    acc[`FullCombo`].push(event)
                    break
                case 10:
                    acc[`FullCombo`].push(event)
                    break
                default:
                    break
            }
            return acc
        }, {
            'Normal': [], 'Hard': [], 'ExHard': [], 'FullCombo': [],
        } as { [key: string]: IMinIRUserEventEntity[] })
    }, [updateClearLamp])
    const newLampComponent = () => {
        return (
            <Flex flexDirection={`column`} gap={2} backgroundColor={`gray.100`}>
                <Box>
                    <Heading w={`100%`} textAlign={`center`}>New Clear Lamp</Heading>
                </Box>
                <Grid templateColumns={{ base: `repeat(2, 1fr)`, md: `repeat(4, 1fr)` }} gap={1}>{Object.keys(lampGroup).map((key) => {
                    const events = lampGroup[key]
                    const clearNumber = clearStringValue(key)
                    const clearStl = clearStyle(clearNumber)
                    if (!events.length) {
                        return (
                            <GridItem bg={clearStl.backgroundColor} p={2} key={key}>
                                <Heading w={`100%`} textAlign={`center`} fontSize={`large`} fontFamily={`Orbitron`}>{key}</Heading>
                                <Text textAlign={`center`} py={4}>
                                    No Record
                                </Text>
                            </GridItem>
                        )
                    }

                    return (
                        <GridItem bg={clearStl.backgroundColor} p={2} key={key}>
                            <Heading w={`100%`} textAlign={`center`} fontSize={`large`} mb={2} fontFamily={`Orbitron`}>{key}</Heading>
                            <Flex flexDirection={`column`} gap={2}>
                                {events.map((event) => {
                                    const payload = JSON.parse(event.payload || '{}')
                                    if (!!payload.song) {
                                        return (
                                            <Card key={event.uuid}>
                                                <CardBody p={1}>
                                                    <Flex justifyContent={`space-between`} alignItems={`center`}>
                                                        <Heading size="sm" fontFamily={`Oswald`}>
                                                            <Link as={ReactLink} variant="plain"
                                                                  to={`/viewer/song/${payload.song.sha256}/${payload.song.lnmode}/score/${event.userId}`}>
                                                                {payload.song.title}
                                                            </Link>
                                                        </Heading>
                                                        {tableComponent(payload.song.sha256)}
                                                    </Flex>
                                                </CardBody>
                                            </Card>
                                        )
                                    } else if (!!payload.cource) {
                                        return (
                                            <Card key={event.uuid}>
                                                <CardBody p={1}>
                                                    <Heading size="sm" fontFamily={`Oswald`}>
                                                        {payload.cource.name}
                                                    </Heading>
                                                </CardBody>
                                            </Card>
                                        )
                                    }
                                })}
                            </Flex>
                        </GridItem>
                    )
                })}</Grid>
            </Flex>
        )
    }

    return (
        <Flex flexDirection={`column`} gap={2} w={`100%`}>
            {newLampComponent()}
            <Grid templateColumns={{ base: `repeat(1, 1fr)`, md: `repeat(2, 1fr)` }} gap={1}>
                <GridItem>
                    {updateScoreComponent()}
                </GridItem>
                <GridItem>
                    {updateClearLampComponent()}
                </GridItem>
            </Grid>
        </Flex>
    )
}