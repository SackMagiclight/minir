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
import { useEffect, useMemo, useState } from 'react'
import { DefaultLayout } from '~/layout/Default'
import { CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { Helmet } from 'react-helmet-async'
import { Link as ReactLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getTokens, getUserId, setAccessToken, setRefreshToken } from '../../store/userStore'
import { useDeleteRivalRemoveMutation, useGetUserQuery, usePostMeMutation, usePutRivalAddMutation, usePutUserUpdateMutation } from '../api'
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
    const [isLoadingLoginUserData, setLoadingLoginUserData] = useBoolean()
    const [isUpdateBio, setUpdateBio] = useBoolean()
    const toast = useToast()

    const [loginUserData, setLoginUserData] = useState<UserDataLogin>()
    const [loginUserBio, setLoginUserBio] = useState('')

    const tokens = useSelector(getTokens)
    const loginUserId = useSelector(getUserId)
    const [getUserDataQuery] = usePostMeMutation()
    const { data: userData, isSuccess } = useGetUserQuery(
        { userId: urlParams.userId ?? '' },
        {
            skip: !urlParams.userId,
        },
    )
    const [putBioQuery] = usePutUserUpdateMutation()
    const dispatch = useDispatch()

    useEffect(() => {
        !(async () => {
            setLoadingLoginUserData.on()
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
    }, [urlParams.userId])

    const isRival = useMemo(() => {
        if (!loginUserData) return false
        return !!loginUserData.userData.rivals.find((r) => r.userId === urlParams.userId)
    }, [loginUserData])

    useEffect(() => {
        setLoadingLoginUserData.off()
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
        if (!loginUserData || !tokens) return
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

    const [addRivalQuery] = usePutRivalAddMutation()
    const [removeRivalQuery] = useDeleteRivalRemoveMutation()
    

    const addRemoveRival = async (command: 'add' | 'remove') => {
        if (!loginUserData || !tokens) return

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
        if (tokens.accessToken) {
            return loginUserData?.scoreDatas
        } else {
            return userData?.scoreDatas
        }
    }, [userData, loginUserData])

    return (
        <DefaultLayout>
            <Helmet>
                <title>{userData?.userData.userName ?? loginUserData?.userData.userName ?? ''}</title>
            </Helmet>
            <Box padding={4}>
                {(isSuccess || isLoadingLoginUserData) && <Progress size="xs" isIndeterminate />}
                {!isSuccess && !isLoadingLoginUserData && (
                    <>
                        <TableContainer>
                            <Table size="sm">
                                <Tbody>
                                    <Tr>
                                        <Td>USER ID</Td>
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
                                        <Td>{userData?.userData.userName ?? loginUserData?.userData.userName ?? ''}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>BIO</Td>
                                        <Td>
                                            {!!urlParams.userId && userData && (
                                                <Textarea readOnly rows={10} value={userData?.userData.bio ?? ''}></Textarea>
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
                                            {!!loginUserData.userData.rivals.length && (
                                                <Tr>
                                                    <Td>RIVAL</Td>
                                                    <Td>
                                                        {loginUserData.userData.rivals.map((r, index) => (
                                                            <Link key={index} as={ReactLink} to={`/viewer/user/${r.userId}`}>
                                                                {r.userName}
                                                            </Link>
                                                        ))}
                                                    </Td>
                                                </Tr>
                                            )}
                                        </>
                                    )}
                                    {!!urlParams.userId && !!userData && !!tokens && (
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
                                    {scoreData?.map((d, index) => (
                                        <Tr key={index}>
                                            <Td>
                                                <Link
                                                    as={ReactLink}
                                                    to={`/viewer/${d.songhash.split('.')[0].length == 67 ? 'course' : 'song'}/${
                                                        d.songhash.split('.')[0]
                                                    }/0`}>
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
