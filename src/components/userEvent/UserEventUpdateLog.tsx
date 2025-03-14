import { IMinIRUserEventEntity } from '~/entities'
import { Box, Card, CardBody, Flex, Grid, GridItem, Heading, Text } from '@chakra-ui/react'
import dayjs from 'dayjs'
import { MdDoubleArrow } from 'react-icons/md'
import { clearStyle } from '~/util/clearLampUtil'
import { useMemo } from 'react'

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

export default ({eventList}: {eventList: IMinIRUserEventEntity[]}) => {
    const updateScore = useMemo(() => {
        return eventList.filter((event) => event.eventType === 'score')
    }, [eventList])
    const updateScoreComponent = () => {
        return updateScore.length ? (
            <Box bg={`gray.100`} p={2} >
                <Heading w={`100%`} textAlign={`center`}>Score</Heading>
                <Flex flexDirection={`column`} gap={2} >
                    {updateScore.map((event) => {
                        const payload = JSON.parse(event.payload || '{}')
                        return (
                            <Card key={event.uuid} >
                                <CardBody p={1}>
                                    <Flex justifyContent={`space-between`} alignItems={`center`} >
                                        <Box fontSize={`x-small`} fontFamily={`Anta`}>{payload.song.notes} NOTES</Box>
                                        <Box fontSize={`x-small`} fontFamily={`Roboto`}>{dayjs(event.timestamp).format("HH:mm:ss")}</Box>
                                    </Flex>
                                    <Heading size='md' fontFamily={`Oswald`}>{payload.song.title}</Heading>
                                    <Flex alignItems={`center`} >
                                        <Text fontSize={`small`} mt={2} fontFamily={`Orbitron`}>
                                            {event.beforeValue ?? `No Score`}
                                        </Text>
                                        <Box as={MdDoubleArrow} fontSize={`19.5px`} mt={2} />
                                        <Flex gap={1} alignItems={`baseline`}>
                                            <Text fontSize={`x-large`} fontFamily={`Orbitron`} color={`red.500`}>{event.afterValue}</Text>
                                            <Text fontSize={`medium`} fontFamily={`Orbitron`}>{event.beforeValue ? `(+${Number(event.afterValue) - Number(event.beforeValue)})` : ``}</Text>
                                        </Flex>
                                    </Flex>
                                </CardBody>
                            </Card>
                        )
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
            <Box bg={`gray.100`} p={2} >
                <Heading w={`100%`} textAlign={`center`}>Clear Lamp</Heading>
                <Flex flexDirection={`column`} gap={2} >
                    {updateClearLamp.map((event) => {
                        const payload = JSON.parse(event.payload || '{}')
                        const beforeValue = event.beforeValue ? clearStyle(Number(event.beforeValue)) : undefined
                        const afterValue = clearStyle(Number(event.afterValue))
                        return (
                            <Card key={event.uuid} >
                                <CardBody p={1}>
                                    <Flex justifyContent={`space-between`} alignItems={`center`} >
                                        <Box fontSize={`x-small`} fontFamily={`Anta`}>{payload.song.notes} NOTES</Box>
                                        <Box fontSize={`x-small`} fontFamily={`Roboto`}>{dayjs(event.timestamp).format("HH:mm:ss")}</Box>
                                    </Flex>
                                    <Heading size='md' fontFamily={`Oswald`} marginBottom={2}>{payload.song.title}</Heading>
                                    <Flex alignItems={`center`} >
                                        <Text fontSize={`small`} fontFamily={`Orbitron`} px={2} py={1} w={`128px`} textAlign={`center`} backgroundColor={beforeValue?.backgroundColor ?? `gray.300`}>
                                            {beforeValue ? beforeValue.text : `No Play`}
                                        </Text>
                                        <Box as={MdDoubleArrow} fontSize={`19.5px`} />
                                        <Text fontSize={`small`} fontFamily={`Orbitron`} px={2} py={1}  w={`128px`} textAlign={`center`}  backgroundColor={afterValue.backgroundColor}>{afterValue.text}</Text>
                                    </Flex>
                                </CardBody>
                            </Card>
                        )
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
            }
            , {
                "Normal": [],
                "Hard": [],
                "ExHard": [],
                "FullCombo": [],
            } as { [key: string]: IMinIRUserEventEntity[] })
    }, [updateClearLamp])
    const newLampComponent = () => {
        return <Grid templateColumns="repeat(4, 1fr)" gap={1} >{Object.keys(lampGroup).map((key) => {
            const events = lampGroup[key]
            const clearNumber = clearStringValue(key)
            const clearStl = clearStyle(clearNumber)
            if (!events.length) {
                return (
                    <GridItem bg={clearStl.backgroundColor} p={2} key={key} >
                        <Heading w={`100%`} textAlign={`center`} fontSize={`large`}>New {key} Clear</Heading>
                        <Text textAlign={`center`} py={4}>
                            No Record
                        </Text>
                    </GridItem>
                )
            }

            return (
                <GridItem bg={clearStl.backgroundColor} p={2} key={key} >
                    <Heading w={`100%`} textAlign={`center`} fontSize={`large`}>New {key} Clear</Heading>
                    <Flex flexDirection={`column`} gap={2} >
                        {events.map((event) => {
                            const payload = JSON.parse(event.payload || '{}')
                            return (
                                <Card key={event.uuid} >
                                    <CardBody p={1}>
                                        <Heading size='md' fontFamily={`Oswald`} marginBottom={2}>{payload.song.title}</Heading>
                                    </CardBody>
                                </Card>
                            )
                        })}
                    </Flex>
                </GridItem>
            )
        })}</Grid>
    }

    return (
        <Flex flexDirection={`column`} gap={2} w={`100%`} >
            {newLampComponent()}
            <Grid  templateColumns="repeat(2, 1fr)" gap={1}>
                <GridItem >
                {updateScoreComponent()}
                </GridItem>
                <GridItem >
                {updateClearLampComponent()}
                </GridItem>
            </Grid>
        </Flex>
    )
}