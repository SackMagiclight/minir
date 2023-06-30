import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Flex, Heading, Icon, Image, Link, List, ListIcon, ListItem, Text } from '@chakra-ui/react'
import { DefaultLayout } from '~/layout/Default'
import histories from '~/static/history.json'
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
    return (
        <DefaultLayout>
            <Helmet>
                <title>MinIR</title>
            </Helmet>
            <Flex justify={'center'}>
                <Image boxSize={'60%'} objectFit={'cover'} src={'./logo.png'}></Image>
            </Flex>
            <Box padding={4} bg={'gray.100'}>
                <Heading textAlign={'center'}>Update history</Heading>
                <List spacing={3}>
                    {histories.map((history, index) => (
                        <ListItem key={index}>
                            <Flex align={'start'}>
                                <ListIcon boxSize={6}>{createIcon(history.icon)}</ListIcon>
                                <Box>
                                    <Text>{history.text}</Text>
                                    <Text fontSize='xs'>{history.date}</Text>
                                </Box>
                            </Flex>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </DefaultLayout>
    )
}
