import { PayloadAction, createSlice } from '@reduxjs/toolkit'

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
    selectors: {
        getTokens: (state) => {
            return {
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
            }
        },
        getUserId: (state) => {
            return state.userId
        },
    }
})

export const { setAccessToken, setRefreshToken, setUserId, reset } = userSlice.actions
export const { getTokens, getUserId } = userSlice.selectors
export default userSlice.reducer
