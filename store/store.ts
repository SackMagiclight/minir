import { configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import userStore from './userStore'
import { api } from '../src/api'

const persistConfig = {
    key: 'user',
    storage,
    whitelist: ['userStore'],
}

const persistedReducer = persistReducer(persistConfig, userStore)

export const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer,
        persistedReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
})

export const persistor = persistStore(store)
