export const useGtag: () => {
    trackingId: string
    gtag: Gtag.Gtag
} = () => {
    const trackingId = 'GTM-TLHGRTS'

    window.dataLayer = window.dataLayer || []

    function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer.push(arguments)
    }

    return {
        trackingId,
        gtag,
    }
}

declare global {
    interface Window {
        dataLayer: ArrayLike<string>[]
    }
}
