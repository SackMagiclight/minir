import React, { FC } from 'react'
import ReactDOM from 'react-dom'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from 'react-query'
import AWS from 'aws-sdk'

import { GeneralGtag } from '~/components/uiParts/Gtag/GeneralGtag'
import { useVh } from '~/hooks/useVh'
import App from '~/pages/_app'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { Amplify } from 'aws-amplify'
import awsConfig from './util/aws'
import { StepsStyleConfig as StepsConfig } from 'chakra-ui-steps'

const Root: FC<{ children: any }> = ({ children }) => {
    const { VhVariable } = useVh()
    const queryClient = new QueryClient()
    AWS.config.region = 'us-east-1'

    const theme = extendTheme({
        components: {
            Steps: StepsConfig,
        },
    })

    return (
        <>
            <QueryClientProvider client={queryClient}>
                <HelmetProvider>
                    <GeneralGtag />
                    {VhVariable}
                    <ChakraProvider theme={theme} resetCSS>{children}</ChakraProvider>
                </HelmetProvider>
            </QueryClientProvider>
        </>
    )
}

Amplify.configure(awsConfig)

const root = createRoot(document.getElementById('root')!)

root.render(
    <React.StrictMode>
        <Root>
            <App />
        </Root>
    </React.StrictMode>,
)
