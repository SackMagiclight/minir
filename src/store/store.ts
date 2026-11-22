import { configureStore, ThunkAction, Action, combineReducers, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { setupListeners } from '@reduxjs/toolkit/query'

import userStore, { getTokens, invalidateStellaLink, setAccessToken, setRefreshToken, stellaLinkSlice } from './userStore'
import { api } from '../api'

const persistConfig = {
    key: 'MinIR',
    storage,
    whitelist: ['user'],
}

const userConfig = {
    key: 'user',
    storage: storage,
}

const reducers = combineReducers({
    user: persistReducer(userConfig, userStore),
})

const persistedReducer = persistReducer(persistConfig, reducers)

const reducer = combineReducers({
    persistedReducer,
    stellaLink: stellaLinkSlice.reducer,
    [api.reducerPath]: api.reducer,
})

const sessionListener = createListenerMiddleware<RootState>()
sessionListener.startListening({
    matcher: isAnyOf(setAccessToken, setRefreshToken),
    effect: (_, { dispatch, getOriginalState, getState }) => {
        const previous = getTokens(getOriginalState())
        const current = getTokens(getState())
        if (previous.accessToken !== current.accessToken || previous.refreshToken !== current.refreshToken) {
            dispatch(invalidateStellaLink())
        }
    },
})

export const store = configureStore({
    reducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(sessionListener.middleware).concat(api.middleware),
})

setupListeners(store.dispatch)
export const persistor = persistStore(store)

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof reducer>
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>
