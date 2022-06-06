import { Global } from '@emotion/react'
import { useMemo } from 'react'

import { useResizeEvent } from '~/hooks/useResizeEvent'

export const useVh = () => {
    const size = useResizeEvent()

    const VhVariable = useMemo(
        () => (
            <Global
                styles={{
                    html: {
                        '--vh': size.vh,
                        '--vw': size.vw,
                    },
                }}
            />
        ),
        [size],
    )

    return {
        vh: size.vh,
        VhVariable,
    }
}
