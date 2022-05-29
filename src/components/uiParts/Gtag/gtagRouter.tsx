import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { useGtag } from '~/components/uiParts/Gtag/useGtag'

export const GtagRouter = () => {
    const location = useLocation()
    const { gtag, trackingId } = useGtag()

    useEffect(() => {
        console.log('change location path:', location)
        gtag('event', 'page_view', {
            page_title: document.title,
            page_path: location.pathname + location.search,
            page_location: location.pathname + location.search,
        })
    }, [gtag, location, trackingId])

    return <></>
}
