import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Flex,
    FormControl,
    Text,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Stack,
    useBoolean,
    useDisclosure,
    Container,
    Heading,
    Image,
    FormErrorMessage,
    Divider,
} from '@chakra-ui/react'
import { FocusableElement } from '@chakra-ui/utils'
import { DefaultLayout } from '~/layout/Default'
import { Helmet } from 'react-helmet-async'
import { FaLock, FaUserAlt } from 'react-icons/fa'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAccessKeyAndSecret } from '~/util/decrypt'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import React from 'react'
import { MdAlternateEmail } from 'react-icons/md'
import { Buffer } from 'buffer'

export default () => {
    const [showPassword, setShowPassword] = useBoolean()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [isLoading, setLoading] = useBoolean()
    const [userName, setUserName] = useState<string>()
    const [email, setEmail] = useState<string>()
    const [password, setPassword] = useState<string>()
    const [errorMessage, setErrorMessage] = useState('')
    const navigate = useNavigate()

    const changeUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserName(e.target.value)
    }
    const changeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
    }
    const changePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    }

    const clickSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setLoading.toggle()
        let errorMsg = ''
        !(async () => {
            try {
                const ks = getAccessKeyAndSecret('sign_up').split(',')
                const client = new LambdaClient({
                    region: 'us-east-1',
                    credentials: {
                        accessKeyId: ks[0],
                        secretAccessKey: ks[1],
                    },
                })
                const params = {
                    FunctionName: 'sign_up',
                    Payload: Buffer.from(
                        JSON.stringify({
                            username: userName,
                            email: email,
                            password: password,
                        }),
                    ),
                }

                const command = new InvokeCommand(params)
                const data = await client.send(command)
                if (new TextDecoder().decode(data.Payload) != 'true') {
                    const json = JSON.parse(new TextDecoder().decode(data.Payload))
                    if (json.errorMessage) {
                        errorMsg = JSON.stringify(json.errorMessage, undefined, 1)
                    }
                } else {
                    onOpen()
                }
            } catch (e) {
                console.log(JSON.stringify(e, undefined, 1))
            } finally {
                setErrorMessage(errorMsg)
                setLoading.toggle()
            }
        })()
    }

    const cancelRef = useRef<FocusableElement>(null)
    const completeClose = () => {
        onClose()
        navigate('/')
    }

    const [errors, setErrors] = useState({ userName: '', email: '', password: '' })
    useEffect(() => {
        const newState = { userName: '', email: '', password: '' }
        if (userName !== undefined && !userName) {
            newState.userName = 'User name is required.'
        }

        if (email !== undefined && !email) {
            newState.email = 'email is required.'
        }

        if (password !== undefined && !password) {
            newState.password = 'password is required.'
        } else if (password !== undefined && password.length < 8) {
            newState.password = 'password must be at least 8 characters.'
        }

        setErrors(newState)
    }, [userName, email, password])

    const valid = useMemo(() => {
        return !errors.userName && !errors.email && !errors.password && userName && email && password
    }, [errors, userName, email, password])

    return (
        <DefaultLayout>
            <Helmet>
                <title>Create User</title>
            </Helmet>
            <Flex mt={4} flexDirection="column" justifyContent="center" alignItems="center">
                <Stack flexDir="column" mb="2" justifyContent="center" alignItems="center">
                    <Box minW={{ base: '90%', md: '468px' }}>
                        <form>
                            <Stack spacing={4} p="1rem" backgroundColor="whiteAlpha.900" boxShadow="md">
                                <Flex alignItems={'center'} flexDirection={'column'} m={4}>
                                    <Image boxSize={'40%'} objectFit={'cover'} src={'./icons/icon-512x512.png'}></Image>
                                    <Heading size={'md'} textAlign={'center'}>
                                        Create Account
                                    </Heading>
                                </Flex>
                                {!!errorMessage && (
                                    <Container color={'red.500'} borderWidth="1px" borderRadius="lg">
                                        Error: {errorMessage}
                                    </Container>
                                )}
                                <FormControl isInvalid={!!errors.userName}>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none" children={<FaUserAlt color="#CBD5E0" />} />
                                        <Input
                                            isRequired
                                            name="username"
                                            type="text"
                                            placeholder="user name (nickname / display name)"
                                            onChange={changeUserName}
                                            value={userName}
                                        />
                                    </InputGroup>
                                    <FormErrorMessage>{errors.userName}</FormErrorMessage>
                                </FormControl>
                                <FormControl isInvalid={!!errors.email}>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none" children={<MdAlternateEmail color="#CBD5E0" />} />
                                        <Input
                                            isRequired
                                            name="email"
                                            type="email"
                                            placeholder="email address"
                                            onChange={changeEmail}
                                            value={email}
                                        />
                                    </InputGroup>
                                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                                </FormControl>
                                <FormControl isInvalid={!!errors.password}>
                                    <InputGroup>
                                        <InputLeftElement
                                            pointerEvents="none"
                                            color="gray.300"
                                            children={<FaLock color="#CBD5E0" />}
                                        />
                                        <Input
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="password"
                                            onChange={changePassword}
                                            value={password}
                                        />
                                        <InputRightElement width="4.5rem">
                                            <Button h="1.75rem" size="sm" onClick={setShowPassword.toggle}>
                                                {showPassword ? 'Hide' : 'Show'}
                                            </Button>
                                        </InputRightElement>
                                    </InputGroup>
                                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                                </FormControl>
                                <Button
                                    disabled={!valid}
                                    isLoading={isLoading}
                                    borderRadius={0}
                                    type="submit"
                                    variant="solid"
                                    colorScheme="teal"
                                    width="full"
                                    onClick={clickSubmit}>
                                    Create User
                                </Button>
                            </Stack>
                        </form>
                    </Box>
                </Stack>
            </Flex>
            <AlertDialog
                motionPreset="slideInBottom"
                leastDestructiveRef={cancelRef}
                onClose={() => completeClose()}
                isOpen={isOpen}
                isCentered>
                <AlertDialogOverlay />

                <AlertDialogContent>
                    <AlertDialogHeader>Create Complete</AlertDialogHeader>
                    <AlertDialogCloseButton />
                    <AlertDialogBody>
                        <Text>Please click the link of authentication mail, please complete registration.</Text>
                        <Divider></Divider>
                        <Text>認証メールを確認し、登録を完了させてください。</Text>
                    </AlertDialogBody>
                </AlertDialogContent>
            </AlertDialog>
        </DefaultLayout>
    )
}
