import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { BookOpen, Phone, Lock, User, GraduationCap, Sparkles } from 'lucide-react'

const Login = () => {
    const [mobileNumber, setMobileNumber] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        
        const success = await login(mobileNumber, password)
        
        if (success) {
            const role = localStorage.getItem('userRole')
            if (role === 'admin') {
                navigate('/admin/students')
            } else if (role === 'parent') {
                navigate('/parent/dashboard')
            } else {
                navigate('/')
            }
        }
        
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white flex items-center justify-center p-4">
            {/* Animated background circles */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full opacity-20 animate-pulse"></div>
            </div>

            <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-purple-100">
                {/* Logo Section with Sparkle */}
                <div className="text-center mb-8">
                    <div className="relative inline-block">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                            <BookOpen className="h-12 w-12 text-white" />
                        </div>
                        <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-purple-500 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold mt-4">
                        <span className="text-gray-800">Welcome to</span>
                        <span className="bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent block">
                            Santa Maria Tuition
                        </span>
                    </h2>
                    <p className="text-gray-500 text-sm mt-2">Login to access your dashboard</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                            Mobile Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 h-5 w-5 text-purple-400" />
                            <input
                                type="tel"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                placeholder="7356225520"
                                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-purple-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-102 transition-all duration-300 disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <p className="text-xs text-purple-700 text-center">
                        <span className="font-semibold">Demo Access:</span> Teacher: 7356225520 / password123
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login