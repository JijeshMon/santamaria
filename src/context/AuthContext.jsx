import React, { createContext, useState, useContext, useEffect } from 'react'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [userRole, setUserRole] = useState(null)

    useEffect(() => {
        // Check localStorage for existing session
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            const userData = JSON.parse(storedUser)
            setUser(userData)
            setUserRole(userData.role)
        }
        setLoading(false)
    }, [])

    const login = async (mobileNumber, password) => {
        try {
            // First, check if user exists in our database
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('mobile_number', mobileNumber)
                .single()

            if (userError || !userData) {
                toast.error('User not found! Please contact teacher to register.')
                return false
            }

            // Check password
            if (userData.password !== password) {
                toast.error('Invalid password!')
                return false
            }

            // Create session object
            const sessionUser = {
                id: userData.id,
                mobile_number: userData.mobile_number,
                phone: userData.mobile_number,
                role: userData.role,
                full_name: userData.full_name
            }
            
            setUser(sessionUser)
            setUserRole(userData.role)
            localStorage.setItem('user', JSON.stringify(sessionUser))
            localStorage.setItem('userRole', userData.role)
            toast.success(`Welcome ${userData.full_name}!`)
            return true
            
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    const logout = async () => {
        setUser(null)
        setUserRole(null)
        localStorage.removeItem('user')
        localStorage.removeItem('userRole')
        toast.success('Logged out successfully')
    }

    const value = {
        user,
        userRole,
        loading,
        login,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}