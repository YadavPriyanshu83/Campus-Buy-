import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'
import headerReducer from './headerSlice'
import appReducer from './appSlice'
import productReducer from './productSlice'

const appstore = configureStore({
    reducer: {
        user: userReducer,
        header: headerReducer,
        app: appReducer,
        product: productReducer,
    },
    devTools: true,
})

export default appstore 