import {
    Box,
    Table,
    TableContainer,
    Tbody,
    Td,
    Tr,
    Progress,
    useBoolean,
    IconButton,
    Input,
    InputGroup,
    InputRightElement,
    Textarea,
    useToast,
    Th,
    Thead,
    Link,
    Text,
    Button,
    Flex,
} from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import { getAccessKeyAndSecret } from '~/util/decrypt'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { useEffect, useMemo, useState } from 'react'
import { DefaultLayout } from '~/layout/Default'
import { CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { Helmet } from 'react-helmet-async'
import { Auth } from 'aws-amplify'
import { Link as ReactLink } from 'react-router-dom'
import { Buffer } from 'buffer'

type UserData = {
    username: string
    bio: string
}

type UserDataLogin = {
    userid: string
    datetime: string
    publickey?: string
    rivals: Rival[]
    contest: Contest[]
} & UserData

type SongList = {
    title: string
    artist: string
    songhash: string
}

type Rival = {
    username: string
    userid: string
}

type Contest = {
    contestId: string
    contestName: string
}

type CognitoType = {
    AccessToken: string
    RefreshToken: string
    UserId: string
}

export default () => {
    const urlParams = useParams<{ userId?: string }>()
    const [isLoadingUserData, setLoadingUserData] = useBoolean()
    const [isLoadingLoginUserData, setLoadingLoginUserData] = useBoolean()
    const [isUpdateBio, setUpdateBio] = useBoolean()
    const toast = useToast()

    const [userData, setUserData] = useState<UserData>()
    const [loginUserData, setLoginUserData] = useState<UserDataLogin>()
    const [userId, serUserId] = useState<string>()
    const [loginUser, serLoginUser] = useState<CognitoType>()
    const [loginUserBio, setLoginUserBio] = useState('')
    const [songData, setSongData] = useState<SongList[]>()

    useEffect(() => {
        !(async () => {
            serUserId(urlParams.userId)
            serLoginUser(await getLoginUserId())
        })()
    }, [urlParams.userId])

    const isRival = useMemo(() => {
        if (!loginUserData) return false
        return !!loginUserData.rivals.find((r) => r.userid === userId)
    }, [userId, loginUserData])

    const getLoginUserId = async () => {
        setLoadingLoginUserData.on()
        try {
            const data = await Auth.currentAuthenticatedUser()
            const returnData = {
                AccessToken: data.signInUserSession.accessToken.jwtToken,
                RefreshToken: data.signInUserSession.refreshToken.token,
                UserId: data.signInUserSession.idToken.payload.sub,
            }
            return returnData
        } catch (err) {
            return undefined
        }
    }

    useEffect(() => {
        setLoadingLoginUserData.off()
    }, [loginUserData])

    useEffect(() => {
        setLoadingUserData.off()
    }, [userData])

    useEffect(() => {
        !(async () => {
            if (!userId) return

            setLoadingUserData.on()
            const ks = getAccessKeyAndSecret('get_user_data').split(',')
            const client = new LambdaClient({
                region: 'us-east-1',
                credentials: {
                    accessKeyId: ks[0],
                    secretAccessKey: ks[1],
                },
            })
            const params = {
                FunctionName: 'get_user_data',
                Payload: Buffer.from(
                    JSON.stringify({
                        userId,
                    }),
                ),
            }

            try {
                const command = new InvokeCommand(params)
                const data = await client.send(command)
                const json = JSON.parse(new TextDecoder().decode(data.Payload))
                setUserData(json.UserData)
                setSongData(json.ScoreDatas)
            } catch (e) {}
        })()
    }, [userId])

    const getLoginUserData = async (cognitoData: CognitoType) => {
        setLoadingLoginUserData.on()
        const ks = getAccessKeyAndSecret('get_user_data_login').split(',')
        const client = new LambdaClient({
            region: 'us-east-1',
            credentials: {
                accessKeyId: ks[0],
                secretAccessKey: ks[1],
            },
        })
        const params = {
            FunctionName: 'get_user_data_login',
            Payload: Buffer.from(JSON.stringify(cognitoData)),
        }

        try {
            const command = new InvokeCommand(params)
            const data = await client.send(command)
            const json = JSON.parse(new TextDecoder().decode(data.Payload))
            return json as {
                UserData: UserDataLogin
                ScoreDatas: SongList[]
            }
        } catch (e) {
            return undefined
        }
    }

    useEffect(() => {
        !(async () => {
            if (!loginUser) return

            const data = await getLoginUserData(loginUser)
            if (data) {
                setLoginUserData(data.UserData)
                setLoginUserBio(data.UserData.bio)
                setSongData(data.ScoreDatas)
            }
        })()
    }, [loginUser])

    const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        const id = userId ?? loginUserData?.userid
        if (id) {
            navigator.clipboard.writeText(id)
            toast({
                description: 'Copied.',
                status: 'success',
                duration: 1500,
            })
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const inputValue = e.target.value
        setLoginUserBio(inputValue)
    }

    const updateBio = async () => {
        if (!loginUser) return

        setUpdateBio.on()
        const ks = getAccessKeyAndSecret('update_user_data').split(',')
        const client = new LambdaClient({
            region: 'us-east-1',
            credentials: {
                accessKeyId: ks[0],
                secretAccessKey: ks[1],
            },
        })
        const params = {
            FunctionName: 'update_user_data',
            Payload: Buffer.from(
                JSON.stringify({
                    bio: loginUserBio,
                    AccessToken: loginUser.AccessToken,
                    RefreshToken: loginUser.RefreshToken,
                }),
            ),
        }

        try {
            const command = new InvokeCommand(params)
            const data = await client.send(command)
            const json = JSON.parse(new TextDecoder().decode(data.Payload))
            if (json.message == 'success') {
                toast({
                    description: 'Successfully updated bio.',
                    status: 'success',
                    duration: 1500,
                })
            } else {
                toast({
                    description: 'Failed to update bio.',
                    status: 'error',
                    duration: 1500,
                })
            }
        } catch (e) {
            toast({
                description: 'Failed to update bio.',
                status: 'error',
                duration: 1500,
            })
        } finally {
            setUpdateBio.off()
        }
    }

    const addRemoveRival = async (command: 'add' | 'remove') => {
        if (!loginUser || !userId) return

        const ks = getAccessKeyAndSecret(`${command}_rival`).split(',')
        const client = new LambdaClient({
            region: 'us-east-1',
            credentials: {
                accessKeyId: ks[0],
                secretAccessKey: ks[1],
            },
        })
        const params = {
            FunctionName: `${command}_rival`,
            Payload: Buffer.from(
                JSON.stringify({
                    AccessToken: loginUser.AccessToken,
                    RefreshToken: loginUser.RefreshToken,
                    rivalId: userId,
                }),
            ),
        }

        try {
            const command = new InvokeCommand(params)
            const data = await client.send(command)
            const json = JSON.parse(new TextDecoder().decode(data.Payload))
            if (json.message == 'success') {
                toast({
                    description: `Successfully ${command} rival.`,
                    status: 'success',
                    duration: 1500,
                })
                const data = await getLoginUserData(loginUser)
                if (data) {
                    setLoginUserData(data.UserData)
                    setLoginUserBio(data.UserData.bio)
                    setSongData(data.ScoreDatas)
                }
            } else {
                toast({
                    description: `Failed to ${command} rival.`,
                    status: 'error',
                    duration: 1500,
                })
            }
        } catch (e) {
            toast({
                description: `Failed to ${command} rival.`,
                status: 'error',
                duration: 1500,
            })
        }
    }

    return (
        <DefaultLayout>
            <Helmet>
                <title>{userData?.username ?? loginUserData?.username ?? ''}</title>
            </Helmet>
            <Box padding={4}>
                {(isLoadingUserData || isLoadingLoginUserData) && <Progress size="xs" isIndeterminate />}
                {!isLoadingUserData && !isLoadingLoginUserData && (
                    <>
                        <TableContainer>
                            <Table size="sm">
                                <Tbody>
                                    <Tr>
                                        <Td>USER ID</Td>
                                        <Td>
                                            <InputGroup size="sm">
                                                <Input
                                                    value={userId ?? loginUserData?.userid ?? ''}
                                                    readOnly
                                                    variant="flushed"
                                                    pr="2.5rem"
                                                />
                                                <InputRightElement width="2.5rem">
                                                    <IconButton
                                                        aria-label="copy user id"
                                                        icon={<CopyIcon />}
                                                        size={'xs'}
                                                        onClick={handleCopy}
                                                    />
                                                </InputRightElement>
                                            </InputGroup>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td>NAME</Td>
                                        <Td>{userData?.username ?? loginUserData?.username ?? ''}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>BIO</Td>
                                        <Td>
                                            {!!urlParams.userId && userData && (
                                                <Textarea readOnly rows={10} value={userData?.bio ?? ''}></Textarea>
                                            )}
                                            {!urlParams.userId && !userData && (
                                                <Flex flexDirection={'column'}>
                                                    <Textarea
                                                        rows={10}
                                                        value={loginUserBio}
                                                        onChange={handleInputChange}></Textarea>
                                                    <Button
                                                        isLoading={isUpdateBio}
                                                        colorScheme={'teal'}
                                                        onClick={() => updateBio()}>
                                                        UPDATE BIO
                                                    </Button>
                                                </Flex>
                                            )}
                                        </Td>
                                    </Tr>
                                    {!urlParams.userId && loginUserData && (
                                        <>
                                            {!!loginUserData.rivals.length && (
                                                <Tr>
                                                    <Td>RIVAL</Td>
                                                    <Td>
                                                        {loginUserData.rivals.map((r, index) => (
                                                            <Link key={index} as={ReactLink} to={`/viewer/user/${r.userid}`}>
                                                                {r.username}
                                                            </Link>
                                                        ))}
                                                    </Td>
                                                </Tr>
                                            )}
                                            {!!loginUserData.contest.length && (
                                                <Tr>
                                                    <Td>CONTEST</Td>
                                                    <Td>
                                                        <TableContainer>
                                                            <Table variant="striped" size="sm">
                                                                <Thead>
                                                                    <Tr>
                                                                        <Th w={'32px'}>IR</Th>
                                                                        <Th>TITLE</Th>
                                                                    </Tr>
                                                                </Thead>
                                                                <Tbody>
                                                                    {loginUserData.contest.map((c, index) => (
                                                                        <Tr key={index}>
                                                                            <Td>
                                                                                <Link
                                                                                    as={ReactLink}
                                                                                    to={`/viewer/contest/${c.contestId}`}>
                                                                                    <ExternalLinkIcon />
                                                                                </Link>
                                                                            </Td>
                                                                            <Td>
                                                                                <Text isTruncated>{c.contestName}</Text>
                                                                            </Td>
                                                                        </Tr>
                                                                    ))}
                                                                </Tbody>
                                                            </Table>
                                                        </TableContainer>
                                                    </Td>
                                                </Tr>
                                            )}
                                        </>
                                    )}
                                    {!!urlParams.userId && !!userData && !!loginUserData && (
                                        <Tr>
                                            <Td>RIVAL</Td>
                                            <Td>
                                                {isRival && (
                                                    <Button colorScheme={'red'} onClick={() => addRemoveRival('remove')}>
                                                        Remove Rival
                                                    </Button>
                                                )}
                                                {!isRival && (
                                                    <Button colorScheme={'blue'} onClick={() => addRemoveRival('add')}>
                                                        Add Rival
                                                    </Button>
                                                )}
                                            </Td>
                                        </Tr>
                                    )}
                                </Tbody>
                            </Table>
                        </TableContainer>
                        <TableContainer>
                            <Table variant="striped" size="sm">
                                <Thead>
                                    <Tr>
                                        <Th w={'32px'}>IR</Th>
                                        <Th maxW={'95vw'}>TITLE</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {songData?.map((d, index) => (
                                        <Tr key={index}>
                                            <Td>
                                                <Link as={ReactLink} to={`/viewer/song/${d.songhash.split('.')[0]}/0`}>
                                                    <ExternalLinkIcon />
                                                </Link>
                                            </Td>
                                            <Td maxW={'95vw'}>
                                                <Text isTruncated>{d.title}</Text>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </>
                )}
            </Box>
        </DefaultLayout>
    )
}
