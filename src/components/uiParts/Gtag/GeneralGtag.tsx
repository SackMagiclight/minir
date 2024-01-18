import { Helmet } from 'react-helmet-async'

import { useGtag } from './useGtag'

export type GeneralGtagViewProps = {} & GeneralGtagProps

export const GeneralGtagView = () => {
    const { trackingId } = useGtag()

    return (
        <>
            <Helmet>
                <script async={true} src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`} />
                <script id="google-analytics">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}

                        gtag('js', new Date())
                        gtag('config', '${trackingId}', { send_page_view: true })
                `}
                </script>
            </Helmet>
        </>
    )
}

export type GeneralGtagProps = {}

export const GeneralGtag = (props: JSX.IntrinsicAttributes) => {
    return <GeneralGtagView {...props} />
}
