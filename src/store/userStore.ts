import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootState } from './store'

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

export const getUserId = (state: RootState) => {
    return state.persistedReducer.user.userId
}

export default userSlice.reducer
