import { useEventListener } from '@chakra-ui/hooks'
import { useCallback, useEffect, useState } from 'react'

export const useResizeEvent = () => {
    const [size, setSize] = useState({
        height: 0,
        width: 0,
        vh: '0px',
        vw: '0px',
    })

    const calcSize = useCallback(() => {
        console.log('re calculate')
        setSize({
            height: window.innerHeight,
            width: window.innerWidth,
            vh: `${window.innerHeight * 0.01 || 0}px`,
            vw: `${window.innerWidth * 0.01 || 0}px`,
        })
    }, [])

    useEventListener(
        'resize',
        () => {
            calcSize()
        },
        () => window as unknown as Document,
    )

    useEffect(() => {
        console.log('calculate from effect')
        calcSize()
    }, [calcSize])

    return size
}
