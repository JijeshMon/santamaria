import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogOut, User, BookOpen, Calendar, Star, DollarSign, Home, MessageCircle, Phone, GraduationCap, Menu, X, Users } from 'lucide-react'

const Navbar = () => {
    const { user, userRole, logout } = useAuth()
    const navigate = useNavigate()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    if (!user) return null

    const adminLinks = [
        { path: '/admin/students', icon: Home, label: 'Dashboard' },
        { path: '/admin/students-list', icon: Users, label: 'Students List' },
        { path: '/admin/attendance', icon: Calendar, label: 'Attendance' },
        { path: '/admin/marks', icon: Star, label: 'Marks' },
        { path: '/admin/reviews', icon: MessageCircle, label: 'Reviews' },
        { path: '/admin/fees', icon: DollarSign, label: 'Fees' },
    ]

    return (
        <>
            {/* Top Banner Strip - Lavender Theme */}
            <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-500 text-white py-2">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm gap-2">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Phone className="h-3 w-3" />
                                <span>8921435498</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Phone className="h-3 w-3" />
                                <span>7356225520</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="flex items-center space-x-1">
                                <GraduationCap className="h-3 w-3" />
                                <span>1st-12th Standard</span>
                            </span>
                            <span className="text-purple-300">|</span>
                            <span>State & CBSE</span>
                            <span className="text-purple-300">|</span>
                            <span>Hindi & Computer</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navigation Bar - Lavender Theme */}
            <nav className="bg-white shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo and Brand */}
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-xl shadow-lg transform transition-transform group-hover:scale-105">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <span className="font-bold text-lg md:text-xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                    Santa Maria
                                </span>
                                <span className="font-bold text-lg md:text-xl text-purple-600">
                                    Tuition Centre
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-1">
                            {userRole === 'admin' ? (
                                adminLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className="group relative px-3 py-2 rounded-lg text-gray-600 hover:text-purple-600 transition-all duration-300"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <link.icon className="h-4 w-4" />
                                            <span className="text-sm font-medium">{link.label}</span>
                                        </div>
                                        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-300 group-hover:w-full"></div>
                                    </Link>
                                ))
                            ) : (
                                <Link
                                    to="/parent/dashboard"
                                    className="group relative px-3 py-2 rounded-lg text-gray-600 hover:text-purple-600 transition-all duration-300"
                                >
                                    <div className="flex items-center space-x-2">
                                        <Home className="h-4 w-4" />
                                        <span className="text-sm font-medium">Dashboard</span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-300 group-hover:w-full"></div>
                                </Link>
                            )}

                            <div className="ml-4 pl-4 border-l border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <div className="relative group">
                                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-1.5 rounded-full shadow-md">
                                            <User className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">Logged in as</span>
                                        <span className="text-sm font-semibold text-gray-700">
                                            {userRole === 'admin' ? 'Teacher' : 'Parent'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="ml-2 p-2 rounded-lg text-red-500 hover:bg-red-50 transition-all duration-300"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
                        <div className="px-4 py-3 space-y-2">
                            {userRole === 'admin' ? (
                                adminLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all duration-300"
                                    >
                                        <link.icon className="h-5 w-5" />
                                        <span className="text-sm font-medium">{link.label}</span>
                                    </Link>
                                ))
                            ) : (
                                <Link
                                    to="/parent/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all duration-300"
                                >
                                    <Home className="h-5 w-5" />
                                    <span className="text-sm font-medium">Dashboard</span>
                                </Link>
                            )}
                            
                            <button
                                onClick={() => {
                                    handleLogout()
                                    setMobileMenuOpen(false)
                                }}
                                className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-300"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="text-sm font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Animated Bottom Border - Lavender */}
            <div className="h-0.5 bg-gradient-to-r from-purple-400 via-purple-300 to-purple-400 animate-pulse"></div>
        </>
    )
}

export default Navbar