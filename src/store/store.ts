import { configureStore, ThunkAction, Action, combineReducers } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { setupListeners } from '@reduxjs/toolkit/query'

import userStore from './userStore'
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

export const store = configureStore({
    reducer: {
        persistedReducer,
        [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
})

setupListeners(store.dispatch)
export const persistor = persistStore(store)

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>
