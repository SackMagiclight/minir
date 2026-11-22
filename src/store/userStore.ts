import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import type { RootState } from './store'

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        accessToken: undefined,
        refreshToken: undefined,
        userId: undefined,
    } as {
        accessToken: string | undefined
        refreshToken: string | undefined
        userId: string | undefined
    },
    reducers: {
        setAccessToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload
        },
        setRefreshToken: (state, action: PayloadAction<string>) => {
            state.refreshToken = action.payload
        },
        setUserId: (state, action: PayloadAction<string>) => {
            state.userId = action.payload
        },
        reset: (state) => {
            state.accessToken = undefined
            state.refreshToken = undefined
            state.userId = undefined
        },
    },
    selectors: {},
})

export const { setAccessToken, setRefreshToken, setUserId, reset } = userSlice.actions

export const getTokens = (state: RootState) => {
    return state.persistedReducer.user
}

export const getUserId = createSelector([getTokens], ({ accessToken, userId }) => {
    if (!accessToken) return undefined

    // An older Stella authorization can leave a previous user ID in persisted storage.
    const [, payload] = accessToken.split('.')
    if (payload) {
        try {
            const { sub, token_use } = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
            if (token_use === 'access' && typeof sub === 'string' && sub) return sub
        } catch {
            // Older sessions can still use the ID saved by the login flow.
        }
    }
    return userId
})

type StellaLink = {
    requestId?: string
    userId?: string
    linked?: boolean
    failedAt?: number
}

const initialStellaLink: StellaLink = {}

export const stellaLinkSlice = createSlice({
    name: 'stellaLink',
    initialState: initialStellaLink,
    reducers: {
        checkStellaLink: (_, action: PayloadAction<string>): StellaLink => ({ requestId: action.payload }),
        resolveStellaLink: (state, action: PayloadAction<StellaLink>) => {
            if (state.requestId === action.payload.requestId) return action.payload
        },
        invalidateStellaLink: () => initialStellaLink,
    },
    extraReducers: (builder) => {
        builder
            .addCase(reset, () => initialStellaLink)
            .addCase(setUserId, (state, action) => {
                if (state.userId && state.userId !== action.payload) return initialStellaLink
            })
    },
})

export const { checkStellaLink, resolveStellaLink, invalidateStellaLink } = stellaLinkSlice.actions

export const getStellaLink = (state: RootState) => state.stellaLink

export default userSlice.reducer
