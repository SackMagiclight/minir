import {
    Box,
    Button,
    Flex,
    FormControl,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Stack,
    useBoolean,
    Container,
    Heading,
    Image,
    FormErrorMessage,
} from '@chakra-ui/react'
import { DefaultLayout } from '~/layout/Default'
import { Helmet } from 'react-helmet-async'
import { FaLock } from 'react-icons/fa'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAccessKeyAndSecret } from '~/util/decrypt'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import React from 'react'
import { MdAlternateEmail } from 'react-icons/md'
import { Buffer } from 'buffer'

export default () => {
    const urlParams = useParams<{ serviceName: string; serviceToken: string }>()
    const [showPassword, setShowPassword] = useBoolean()
    const [isLoading, setLoading] = useBoolean()
    const [email, setEmail] = useState<string>()
    const [password, setPassword] = useState<string>()
    const [errorMessage, setErrorMessage] = useState('')
    const navigate = useNavigate()

    const changeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
    }
    const changePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    }

    const encodeQueryData = (data: any) => {
        const ret = []
        for (let d in data) ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]))
        return ret.join('&')
    }

    const login = () => {
        setLoading.toggle()
        let errorMsg = ''
        !(async () => {
            try {
                const ks = getAccessKeyAndSecret('auth_service').split(',')
                const client = new LambdaClient({
                    region: 'us-east-1',
                    credentials: {
                        accessKeyId: ks[0],
                        secretAccessKey: ks[1],
                    },
                })
                const params = {
                    FunctionName: 'auth_service',
                    Payload: Buffer.from(
                        JSON.stringify({
                            username: email,
                            password: password,
                            serviceToken: urlParams.serviceToken,
                            serviceName: urlParams.serviceName,
                        }),
                    ),
                }

                const command = new InvokeCommand(params)
                const data = await client.send(command)
                const json = JSON.parse(new TextDecoder().decode(data.Payload))
                if (json.errorMessage) {
                    errorMsg = JSON.stringify(json.errorMessage, undefined, 1)
                    return
                } else {
                    let url = json.ReturnObj.Url
                    url += '?userid=' + json.UserId
                    if (json.ReturnObj.QueryParams) {
                        url += '&'
                        url += encodeQueryData(json.ReturnObj.QueryParams)
                    }
                    window.location.href = url
                }
            } catch (e) {
                console.log(JSON.stringify(e, undefined, 1))
            } finally {
                setErrorMessage(errorMsg)
                setLoading.toggle()
            }
        })()
    }

    const [errors, setErrors] = useState({ email: '', password: '' })
    useEffect(() => {
        const newState = { email: '', password: '' }
        if (email !== undefined && !email) {
            newState.email = 'email is required.'
        }

        if (password !== undefined && !password) {
            newState.password = 'password is required.'
        } else if (password !== undefined && password.length < 8) {
            newState.password = 'password must be at least 8 characters.'
        }

        setErrors(newState)
    }, [email, password])

    const valid = useMemo(() => {
        return !errors.email && !errors.password && email && password
    }, [errors, email, password])

    const cancel = () => {
        navigate('/')
    }

    return (
        <DefaultLayout>
            <Helmet>
                <title>Service Authorizer</title>
            </Helmet>
            <Flex mt={4} flexDirection="column" justifyContent="center" alignItems="center">
                <Stack flexDir="column" mb="2" justifyContent="center" alignItems="center">
                    <Box minW={{ base: '90%', md: '468px' }}>
                        <form>
                            <Stack spacing={4} p="1rem" backgroundColor="whiteAlpha.900" boxShadow="md">
                                <Flex alignItems={'center'} flexDirection={'column'} m={4}>
                                    <Image boxSize={'40%'} objectFit={'cover'} src={'/icons/icon-512x512.png'}></Image>
                                    <Heading size={'md'} textAlign={'center'}>
                                        Authorize {urlParams.serviceName} to use your account?
                                    </Heading>
                                </Flex>
                                {!!errorMessage && (
                                    <Container color={'red.500'} borderWidth="1px" borderRadius="lg">
                                        {errorMessage}
                                    </Container>
                                )}
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
                                    variant="solid"
                                    colorScheme="teal"
                                    width="full"
                                    onClick={() => login()}>
                                    Confirm
                                </Button>
                                <Button
                                    isLoading={isLoading}
                                    borderRadius={0}
                                    variant="solid"
                                    width="full"
                                    onClick={() => cancel()}>
                                    Cancel
                                </Button>
                            </Stack>
                        </form>
                    </Box>
                </Stack>
            </Flex>
        </DefaultLayout>
    )
}
