import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Box,
    Flex,
    Heading,
    Image,
    List,
    ListIcon,
    ListItem,
    Text,
} from '@chakra-ui/react'
import { DefaultLayout } from '~/layout/Default'
import histories from '~/static/history.json'
import alertJson from '~/static/alert.json'
import { InfoIcon, WarningIcon } from '@chakra-ui/icons'
import { Helmet } from 'react-helmet-async'

export default () => {
    const createIcon = (iconName: string) => {
        switch (iconName) {
            case 'InfoIcon':
                return <InfoIcon color={'blue.500'} />
            case 'WarningIcon':
                return <WarningIcon color={'yellow.500'} />
            default:
                ;<></>
        }
    }

    const alert = () => {
        if (alertJson.length === 0) return <></>

        const due = new Date(alertJson[0].due)
        if (due < new Date()) return <></>

        else {
            const alertData = alertJson[0] as {
                status?: 'info' | 'warning' | 'success' | 'error' | 'loading' | undefined
                title: string
                detail: string
            }
            return (
                <Alert status={alertData.status}>
                    <AlertIcon />
                    <AlertTitle>{alertData.title}</AlertTitle>
                    <AlertDescription dangerouslySetInnerHTML={{ __html: alertData.detail }}></AlertDescription>
                </Alert>
            )
        }
    }

    return (
        <DefaultLayout>
            <Helmet>
                <title>MinIR</title>
            </Helmet>
            {alert()}
            <Flex justify={'center'}>
                <Image boxSize={'60%'} objectFit={'cover'} src={'./logo.png'}></Image>
            </Flex>
            <Box padding={4} bg={'gray.100'}>
                <Heading textAlign={'center'}>Update history</Heading>
                <List spacing={3}>
                    {histories.slice(0, 5).map((history, index) => (
                        <ListItem key={index}>
                            <Flex align={'start'}>
                                <ListIcon boxSize={6}>{createIcon(history.icon)}</ListIcon>
                                <Box>
                                    <Text>{history.text}</Text>
                                    <Text fontSize="xs">{history.date}</Text>
                                </Box>
                            </Flex>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </DefaultLayout>
    )
}
