import { createSlice } from "@reduxjs/toolkit"

const userSlice = createSlice({
    name: "user",
    initialState: {
        // UI State
        showpassword: false,
        
        // Authentication State
        isAuthenticated: !!localStorage.getItem('token'),
        token: localStorage.getItem('token') || null,
        user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
        profile: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {},
        
        // Form Data
        loginForm: {
            email: '',
            password: '',
        },
        registerForm: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            branch: '',
            whatsapp: ''
        },
        
        // OTP Verification Data
        otpData: {
            email: '',
            password: '',
            otp: Array(6).fill("")
        },
    },
    reducers: {
        // UI Actions
        SetShowPassword: (state) => {
            state.showpassword = !state.showpassword
        },
        
        // Authentication Actions
        setAuthenticated: (state, action) => {
            state.isAuthenticated = action.payload
        },
        setToken: (state, action) => {
            state.token = action.payload
            if (action.payload) {
                localStorage.setItem('token', action.payload)
            } else {
                localStorage.removeItem('token')
            }
        },
        setUser: (state, action) => {
            state.user = action.payload
            if (action.payload) {
                localStorage.setItem('user', JSON.stringify(action.payload))
            }
        },
        logout: (state) => {
            state.isAuthenticated = false
            state.token = null
            state.user = null
            state.profile = {}
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        },
        
        // Form Actions
        updateLoginForm: (state, action) => {
            state.loginForm = { ...state.loginForm, ...action.payload }
        },
        updateRegisterForm: (state, action) => {
            state.registerForm = { ...state.registerForm, ...action.payload }
        },
        resetLoginForm: (state) => {
            state.loginForm = { email: '', password: '' }
        },
        resetRegisterForm: (state) => {
            state.registerForm = {
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                branch: '',
                whatsapp: ''
            }
        },
        
        // OTP Actions
        setOtpData: (state, action) => {
            state.otpData = { ...state.otpData, ...action.payload }
        },
        updateOtp: (state, action) => {
            state.otpData.otp = action.payload
        },
        resetOtpData: (state) => {
            state.otpData = {
                email: '',
                password: '',
                otp: Array(6).fill("")
            }
        },
        
        // Profile Actions
        setProfile: (state, action) => {
            state.profile = { ...state.profile, ...action.payload }
            // Also update user object to keep them in sync
            state.user = { ...state.user, ...action.payload }
            // Save to localStorage for persistence
            localStorage.setItem('user', JSON.stringify(state.user))
        },
        updateProfileImage: (state, action) => {
            state.profile.profileImage = action.payload
            if (state.user) {
                state.user.profileImage = action.payload
                localStorage.setItem('user', JSON.stringify(state.user))
            }
        }
    },
})

export const { 
    SetShowPassword,
    setAuthenticated,
    setToken,
    setUser,
    logout,
    updateLoginForm,
    updateRegisterForm,
    resetLoginForm,
    resetRegisterForm,
    setOtpData,
    updateOtp,
    resetOtpData,
    setProfile,
    updateProfileImage
} = userSlice.actions

export default userSlice.reducer
