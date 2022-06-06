import {
    Box,
    Heading,
    Flex,
    Text,
    Button,
    useDisclosure,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Link,
    IconButton,
    Icon,
    List,
    ListItem,
    Divider,
    CloseButton,
} from '@chakra-ui/react'
import { Link as ReactLink, useLocation, useNavigate } from 'react-router-dom'
import { ExternalLinkIcon, HamburgerIcon } from '@chakra-ui/icons'
import { FcAbout } from 'react-icons/fc'
import { MdFileDownload, MdSearch, MdSecurity } from 'react-icons/md'
import { RiPlayList2Fill, RiPlayListAddFill, RiPlayListFill } from 'react-icons/ri'
import { Auth, Hub } from 'aws-amplify'
import { useEffect, useState } from 'react'

const Header = () => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const handleToggle = () => (isOpen ? onClose() : onOpen())
    const navigate = useNavigate()
    const location = useLocation()
    const showTopLink = location.pathname !== '/'

    const played = [
        { title: '7KEYS', key: 'beat-7k' },
        { title: '5KEYS', key: 'beat-5k' },
        { title: '10KEYS', key: 'beat-10k' },
        { title: '14KEYS', key: 'beat-14k' },
        { title: 'PMS 5KEYS', key: 'popn-5k' },
        { title: 'PMS 9KEYS', key: 'popn-9k' },
        { title: 'KM 24KEYS', key: 'keyboard-24k' },
        { title: 'KM 48KEYS', key: 'keyboard-48k' },
    ]

    const [user, setUser] = useState<any | null>(null)
    const getUser = async () => {
        try {
            const userData = await Auth.currentAuthenticatedUser()
            return userData
        } catch (e) {
            return console.log('Not signed in')
        }
    }

    const listener = ({ payload: { event, data } }: { payload: { event: string; data?: any } }) => {
        switch (event) {
            case 'signIn':
            case 'cognitoHostedUI':
                void getUser().then((userData) => setUser(userData))
                break
            case 'signOut':
                setUser(null)
                break
            case 'signIn_failure':
            case 'cognitoHostedUI_failure':
            default:
                console.log('Sign in failure', data)
                break
        }
    }

    useEffect(() => {
        Hub.listen('auth', listener)
        void getUser().then((userData) => setUser(userData))
    }, [])

    const logout = async () => {
        await Auth.signOut()
        navigate('/')
    }

    return (
        <Flex as="nav" align="center" justify="space-between" wrap="wrap" padding={4} bg="#40C0C9" color="white">
            <Flex align="center" mr={5}>
                {showTopLink && (
                    <Heading as="h1" size="lg" letterSpacing={'tighter'}>
                        <Link as={ReactLink} to={'/'}>
                            MinIR
                        </Link>
                    </Heading>
                )}
            </Flex>

            <Box display={{ base: 'block' }}>
                <IconButton aria-label="menu" bg="40C0C9" icon={<HamburgerIcon boxSize={8} />} onClick={handleToggle} />
            </Box>

            <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth="1px">
                        <Flex justify={'end'} w={'full'} marginBottom={1}>
                            <CloseButton onClick={handleToggle} />
                        </Flex>
                        {!user && (
                            <>
                                <Button w={'full'} size={'sm'} as={ReactLink} to={'/login'}>
                                    Login
                                </Button>
                                <Flex justify={'space-between'}>
                                    <Link as={ReactLink} fontSize="sm" to={'/signup'} >
                                        Create Account
                                    </Link>
                                </Flex>
                            </>
                        )}
                        {user && (
                            <>
                                <Button w={'full'} size={'sm'} colorScheme={'teal'} as={ReactLink} to={'/viewer/user'} mb={2}>
                                    User Page
                                </Button>
                                <Button w={'full'} size={'sm'} onClick={logout}>
                                    Logout
                                </Button>
                            </>
                        )}
                    </DrawerHeader>
                    <DrawerBody>
                        <List spacing={2}>
                            <ListItem>
                                <Link as={ReactLink} to={'/about'}>
                                    <Flex align={'center'}>
                                        <Icon as={FcAbout} />
                                        <Text marginLeft={1}>About</Text>
                                    </Flex>
                                </Link>
                            </ListItem>
                            <ListItem>
                                <Link href={'https://drive.google.com/open?id=1wYVNufrfiVAWUkYTVdGl0Q0PqrhkHZBo'} isExternal>
                                    <Flex align={'center'}>
                                        <Icon as={MdFileDownload} />
                                        <Text marginLeft={1}>
                                            Download API
                                            <ExternalLinkIcon mx="2px" />
                                        </Text>
                                    </Flex>
                                </Link>
                            </ListItem>
                            <ListItem>
                                <Link as={ReactLink} to={'/privacy'}>
                                    <Flex align={'center'}>
                                        <Icon as={MdSecurity} />
                                        <Text marginLeft={1}>PrivacyPolicy</Text>
                                    </Flex>
                                </Link>
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <Link as={ReactLink} to={'/search'}>
                                    <Flex align={'center'}>
                                        <Icon as={MdSearch} />
                                        <Text marginLeft={1}>Search BMS</Text>
                                    </Flex>
                                </Link>
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <Link as={ReactLink} to={'/viewer/contest-latest'}>
                                    <Flex align={'center'}>
                                        <Icon as={RiPlayListFill} />
                                        <Text marginLeft={1}>Contest List</Text>
                                    </Flex>
                                </Link>
                            </ListItem>
                            {user && (
                                <ListItem>
                                    <Link as={ReactLink} to={'/viewer/contest-create'}>
                                        <Flex align={'center'}>
                                            <Icon as={RiPlayListAddFill} />
                                            <Text marginLeft={1}>Create Contest</Text>
                                        </Flex>
                                    </Link>
                                </ListItem>
                            )}
                            <Divider />
                            <Heading size={'md'}>Latest 100 played</Heading>
                            {played.map((item, index) => (
                                <ListItem key={index}>
                                    <Link as={ReactLink} to={`/viewer/latest/${item.key}`}>
                                        <Flex align={'center'}>
                                            <Icon as={RiPlayList2Fill} />
                                            <Text marginLeft={1}>{item.title}</Text>
                                        </Flex>
                                    </Link>
                                </ListItem>
                            ))}
                            <Divider />
                            <ListItem>
                                <Link as={ReactLink} to={'/viewer/course-latest'}>
                                    <Flex align={'center'}>
                                        <Icon as={RiPlayListFill} />
                                        <Text marginLeft={1}>Course</Text>
                                    </Flex>
                                </Link>
                            </ListItem>
                        </List>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Flex>
    )
}

export default Header
