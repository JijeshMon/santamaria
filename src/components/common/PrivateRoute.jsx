import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const PrivateRoute = ({ children, allowedRoles = [] }) => {
    const { user, userRole, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-gray-500">Loading...</div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" />
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        return <Navigate to="/" />
    }

    return children
}

export default PrivateRoute