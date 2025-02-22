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
    Image,
} from '@chakra-ui/react'
import { Link as ReactLink, useLocation, useNavigate } from 'react-router-dom'
import { ExternalLinkIcon, HamburgerIcon } from '@chakra-ui/icons'
import { FcAbout } from 'react-icons/fc'
import { MdFileDownload, MdSearch, MdSecurity } from 'react-icons/md'
import { RiPlayList2Fill, RiPlayListFill } from 'react-icons/ri'
import { useMemo } from 'react'
import { useQuery } from 'react-query'
import { getTokens, reset } from '../../../store/userStore'
import { useDispatch, useSelector } from 'react-redux'

const Header = () => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const handleToggle = () => (isOpen ? onClose() : onOpen())
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const showTopLink = location.pathname !== '/'

    const tokens = useSelector(getTokens)

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

    const { isLoading, data } = useQuery(
        'stellaData',
        () => fetch('https://phfvsk24n737l7awzuhf3c4dfi0phcak.lambda-url.us-east-1.on.aws/').then((res) => res.text()),
        { staleTime: 1000 * 60 * 10, cacheTime: Infinity },
    )
    const stateDom = useMemo(() => {
        return (
            <Box>
                <Heading size={'sm'}>Service Status</Heading>
                <Flex>
                    <Text fontSize="xs" mr={1}>
                        Stella Status:
                    </Text>
                    {data === 'OK' ? (
                        <Text fontSize="xs" color={'green.700'}>
                            Operational
                        </Text>
                    ) : data === 'ALARM' ? (
                        <Text fontSize="xs" color={'red.700'}>
                            Too many errors
                        </Text>
                    ) : (
                        <Text fontSize="xs" color={'gray.700'}>
                            {isLoading ? 'Loading...' : 'Unknown'}
                        </Text>
                    )}
                </Flex>
            </Box>
        )
    }, [data])

    const logout = async () => {
        dispatch(reset())
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
                        {!tokens.accessToken && (
                            <>
                                <Button w={'full'} size={'sm'} as={ReactLink} to={'/login'}>
                                    Login
                                </Button>
                                <Flex justify={'space-between'}>
                                    <Link as={ReactLink} fontSize="sm" to={'/signup'}>
                                        Create Account
                                    </Link>
                                </Flex>
                            </>
                        )}
                        {tokens.accessToken && (
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
                                <Link as={ReactLink} to={'/flavor-log'}>
                                    <Flex align={'center'}>
                                        <Image src="/minir/flavorlog/icon.png" w={4} h={4} />
                                        <Text marginLeft={1}>Flavor Log</Text>
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
                            <Divider />
                            <ListItem>{stateDom}</ListItem>
                        </List>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Flex>
    )
}

export default Header
