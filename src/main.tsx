import React, { FC } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from 'react-query'

import { GeneralGtag } from '~/components/uiParts/Gtag/GeneralGtag'
import { useVh } from '~/hooks/useVh'
import App from '~/pages/_app'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { StepsTheme as StepsConfig } from 'chakra-ui-steps'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from "react-redux";
import { store, persistor } from "./store/store";

const Root: FC<{ children: any }> = ({ children }) => {
    const { VhVariable } = useVh()
    const queryClient = new QueryClient()

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
                    <ChakraProvider theme={theme} resetCSS>
                        {children}
                    </ChakraProvider>
                </HelmetProvider>
            </QueryClientProvider>
        </>
    )
}

const root = createRoot(document.getElementById('root')!)

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <Root>
                    <App />
                </Root>
            </PersistGate>
        </Provider>
    </React.StrictMode>,
)
