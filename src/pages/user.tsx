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
    Center,
} from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { DefaultLayout } from '~/layout/Default'
import { CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { Helmet } from 'react-helmet-async'
import { Link as ReactLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getTokens, getUserId, setAccessToken, setRefreshToken } from '../../store/userStore'
import {
    useDeleteRivalRemoveMutation,
    useGetUserQuery,
    usePostMeMutation,
    usePostRivalAddMutation,
    usePutUserUpdateMutation,
} from '../api'
import { IMinIRScoreEntity, IMinIRUserEntity } from '../entities'
import { cloneDeep } from 'lodash'

type UserDataLogin = {
    message: string
    scoreDatas: (IMinIRScoreEntity & { title: string; artist: string })[]
    userData: Omit<IMinIRUserEntity, 'rivals'> & {
        userName: string
        rivals: {
            userId: string
            userName: string | undefined
        }[]
    }
}

export default () => {
    const urlParams = useParams<{ userId?: string }>()
    const [isUpdateBio, setUpdateBio] = useBoolean()
    const toast = useToast()

    const [loginUserData, setLoginUserData] = useState<UserDataLogin>()
    const [loginUserBio, setLoginUserBio] = useState('')

    const tokens = useSelector(getTokens)
    const loginUserId = useSelector(getUserId)
    const [getUserDataQuery, userDataState] = usePostMeMutation()
    const { data: _userData, isFetching } = useGetUserQuery(
        { userId: urlParams.userId ?? '' },
        {
            skip: !urlParams.userId,
        },
    )
    const [putBioQuery] = usePutUserUpdateMutation()
    const dispatch = useDispatch()

    const userData = useMemo(() => {
        if (!_userData) return undefined
        if (!urlParams.userId || urlParams.userId === loginUserId) return undefined
        return _userData
    }, [_userData, urlParams.userId, loginUserId])

    const isMyPage = useMemo(() => {
        if (!loginUserData) return false
        return !urlParams.userId || loginUserData.userData.userid === urlParams.userId
    }, [loginUserData, urlParams])

    useEffect(() => {
        setLoginUserData(undefined)
        setLoginUserBio('')
        !(async () => {
            if (!urlParams.userId || urlParams.userId === loginUserId) {
                const data = await getUserDataQuery({
                    accessToken: tokens?.accessToken ?? '',
                    refreshToken: tokens?.refreshToken ?? '',
                }).unwrap()
                setLoginUserData(data)
                setLoginUserBio(data.userData.bio)
            } else {
                setLoginUserData(undefined)
                setLoginUserBio('')
            }
        })()
    }, [urlParams])

    const isRival = useMemo(() => {
        if (!loginUserData) return false
        return !!loginUserData.userData.rivals.find((r) => r.userId === urlParams.userId)
    }, [loginUserData])

    const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        const id = urlParams.userId ?? loginUserData?.userData.userid
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
        if (!isMyPage) return
        setUpdateBio.on()

        try {
            const result = await putBioQuery({
                accessToken: tokens?.accessToken ?? '',
                refreshToken: tokens?.refreshToken ?? '',
                bio: loginUserBio,
            }).unwrap()
            dispatch(setAccessToken(result.accessToken))
            dispatch(setRefreshToken(result.refreshToken))
            setLoginUserData((state) => {
                if (!state) return state
                const newVal = cloneDeep(state)
                newVal.userData.bio = result.dynamoUser.bio
                return newVal
            })

            toast({
                description: 'Successfully updated bio.',
                status: 'success',
                duration: 1500,
            })
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

    const [addRivalQuery] = usePostRivalAddMutation()
    const [removeRivalQuery] = useDeleteRivalRemoveMutation()

    const addRemoveRival = async (command: 'add' | 'remove') => {
        if (!isMyPage || !loginUserData) return

        try {
            if (command === 'add' && loginUserData.userData.rivals.length < 10) {
                const newRivals = await addRivalQuery({
                    accessToken: tokens?.accessToken ?? '',
                    refreshToken: tokens?.refreshToken ?? '',
                    rivalId: urlParams.userId ?? '',
                }).unwrap()
                setLoginUserData((state) => {
                    if (!state) return state
                    const newVal = cloneDeep(state)
                    newVal.userData.rivals = newRivals
                    return newVal
                })
            } else if (command === 'remove') {
                const newRivals = await removeRivalQuery({
                    accessToken: tokens?.accessToken ?? '',
                    refreshToken: tokens?.refreshToken ?? '',
                    rivalId: urlParams.userId ?? '',
                }).unwrap()
                setLoginUserData((state) => {
                    if (!state) return state
                    const newVal = cloneDeep(state)
                    newVal.userData.rivals = newRivals
                    return newVal
                })
            }

            toast({
                description: `Successfully ${command} rival.`,
                status: 'success',
                duration: 1500,
            })
        } catch (e) {
            toast({
                description: `Failed to ${command} rival.`,
                status: 'error',
                duration: 1500,
            })
        }
    }

    const scoreData = useMemo(() => {
        if (isMyPage) {
            return loginUserData?.scoreDatas
        } else {
            return userData?.scoreDatas
        }
    }, [userData, loginUserData, urlParams.userId, tokens.accessToken])

    const queryUserData = useMemo(() => {
        if (isMyPage) {
            return loginUserData?.userData
        } else {
            return userData?.userData
        }
    }, [userData, loginUserData, isMyPage])

    return (
        <DefaultLayout>
            <Helmet>
                <title>{queryUserData?.userName ?? ''}</title>
            </Helmet>
            <Box padding={4}>
                {!queryUserData || userDataState.isLoading || (isFetching && <Progress size="xs" isIndeterminate />)}
                {!!queryUserData && !userDataState.isLoading && !isFetching && (
                    <>
                        <TableContainer>
                            <Table size="sm">
                                <Tbody>
                                    <Tr>
                                        <Td w={10}>USER ID</Td>
                                        <Td>
                                            <InputGroup size="sm">
                                                <Input
                                                    value={urlParams.userId ?? loginUserData?.userData.userid ?? ''}
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
                                        <Td>{queryUserData?.userName ?? ''}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>BIO</Td>
                                        <Td>
                                            {!!urlParams.userId && (
                                                <Textarea readOnly rows={10} value={queryUserData?.bio ?? ''}></Textarea>
                                            )}
                                            {!urlParams.userId && (
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
                                    {isMyPage && loginUserData && (
                                        <>
                                            {!!loginUserData.userData.rivals?.length && (
                                                <Tr>
                                                    <Td>RIVAL</Td>
                                                    <Td>
                                                        <Box display={'flex'} flexDirection={'row'} columnGap={2}>
                                                            {loginUserData.userData.rivals.map((r, index) => (
                                                                <Box key={index}>
                                                                    <Link as={ReactLink} to={`/viewer/user/${r.userId}`}>
                                                                        {r.userName}
                                                                    </Link>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    </Td>
                                                </Tr>
                                            )}
                                            {!!loginUserData.userData.services?.length && (
                                                <Tr>
                                                    <Td>CONNECTED</Td>
                                                    <Td>
                                                        <Box display={'flex'} flexDirection={'row'} columnGap={2}>
                                                            {loginUserData.userData.services.map((r, index) => (
                                                                <Box key={index}>
                                                                    {r === 'Stella' && (
                                                                        <Link href={'https://stellabms.xyz/'} isExternal>
                                                                            <Flex gap={1}>
                                                                                <Text>
                                                                                    Stella
                                                                                    <ExternalLinkIcon mx="2px" />
                                                                                </Text>
                                                                            </Flex>
                                                                        </Link>
                                                                    )}
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    </Td>
                                                </Tr>
                                            )}
                                        </>
                                    )}
                                    {!isMyPage && (
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
                                        <Th w={10} px={1}>
                                            <Center>IR</Center>
                                        </Th>
                                        <Th w={10} px={1}>
                                            <Center>SCORE</Center>
                                        </Th>
                                        <Th maxW={'95vw'}>TITLE</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {scoreData?.map((d, index) => (
                                        <Tr key={index}>
                                            <Td px={2}>
                                                <Center>
                                                    <Link
                                                        as={ReactLink}
                                                        to={`/viewer/${
                                                            d.songhash.split('.')[0].length == 67 ? 'course' : 'song'
                                                        }/${d.songhash.split('.')[0]}/0`}>
                                                        <ExternalLinkIcon />
                                                    </Link>
                                                </Center>
                                            </Td>
                                            <Td px={2}>
                                                <Center>
                                                    <Link
                                                        as={ReactLink}
                                                        to={`/viewer/${
                                                            d.songhash.split('.')[0].length == 67 ? 'course' : 'song'
                                                        }/${d.songhash.split('.')[0]}/${d.songhash.split('.')[1]}/score/${
                                                            d.userid
                                                        }`}>
                                                        <ExternalLinkIcon />
                                                    </Link>
                                                </Center>
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
