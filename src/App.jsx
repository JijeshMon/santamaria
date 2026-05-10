import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/common/PrivateRoute'
import Navbar from './components/common/Navbar'
import Login from './components/common/Login'
import StudentRegistration from './components/admin/StudentRegistration'
import AttendanceManager from './components/admin/AttendanceManager'
import MarksManager from './components/admin/MarksManager'
import ReviewManager from './components/admin/ReviewManager'
import FeeManager from './components/admin/FeeManager'
import ParentDashboard from './components/parent/ParentDashboard'
import StudentListManager from './components/admin/StudentListManager'

function App() {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-gray-100 flex flex-col">
                <Navbar />
                <div className="flex-grow pb-16">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<Navigate to="/login" />} />
                        
                        {/* Admin Routes */}
                        <Route path="/admin/students" element={
                            <PrivateRoute allowedRoles={['admin']}>
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                    <StudentRegistration />
                                </div>
                            </PrivateRoute>
                        } />
                        <Route path="/admin/attendance" element={
                            <PrivateRoute allowedRoles={['admin']}>
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                    <AttendanceManager />
                                </div>
                            </PrivateRoute>
                        } />
                        <Route path="/admin/marks" element={
                            <PrivateRoute allowedRoles={['admin']}>
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                    <MarksManager />
                                </div>
                            </PrivateRoute>
                        } />
                        <Route path="/admin/reviews" element={
                            <PrivateRoute allowedRoles={['admin']}>
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                    <ReviewManager />
                                </div>
                            </PrivateRoute>
                        } />
                        <Route path="/admin/fees" element={
                            <PrivateRoute allowedRoles={['admin']}>
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                    <FeeManager />
                                </div>
                            </PrivateRoute>
                        } />
                        <Route path="/admin/students-list" element={
                            <PrivateRoute allowedRoles={['admin']}>
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                    <StudentListManager />
                                </div>
                            </PrivateRoute>
                        } />
                        
                        {/* Parent Routes */}
                        <Route path="/parent/dashboard" element={
                            <PrivateRoute allowedRoles={['parent']}>
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                    <ParentDashboard />
                                </div>
                            </PrivateRoute>
                        } />
                    </Routes>
                </div>

                {/* Fixed Footer */}
                <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 shadow-lg z-40">
                    {/* Animated Marquee Section */}
                    <div className="overflow-hidden py-2 border-t border-purple-700">
                        <div className="animate-marquee whitespace-nowrap">
                            <span className="text-purple-200 mx-4 text-sm">
                                🌟 ഈ ആപ്ലിക്കേഷൻ നിങ്ങളുടെ കുട്ടികളുടെ നിലവാരം വിലയിരുത്താനായിട്ടു വേണ്ടിയിട്ട് പരമാവധി പ്രയോജനപ്പെടുത്തുക. 
                            </span>
                            <span className="text-yellow-300 mx-2">
                                ⭐
                            </span>
                            <span className="text-purple-200 mx-4 text-sm">
                                Please make maximum use of this application to evaluate your children's standard/performance. 
                            </span>
                            <span className="text-yellow-300 mx-2">
                                🌟
                            </span>
                            <span className="text-purple-200 mx-4 text-sm">
                                ഈ ആപ്ലിക്കേഷൻ നിങ്ങളുടെ കുട്ടികളുടെ നിലവാരം വിലയിരുത്താനായിട്ടു വേണ്ടിയിട്ട് പരമാവധി പ്രയോജനപ്പെടുത്തുക. 
                            </span>
                            <span className="text-yellow-300 mx-2">
                                ⭐
                            </span>
                            <span className="text-purple-200 mx-4 text-sm">
                                Please make maximum use of this application to evaluate your children's standard/performance. 
                            </span>
                            <span className="text-yellow-300 mx-2">
                                🌟
                            </span>
                            <span className="text-purple-200 mx-4 text-sm">
                                ഈ ആപ്ലിക്കേഷൻ നിങ്ങളുടെ കുട്ടികളുടെ നിലവാരം വിലയിരുത്താനായിട്ടു വേണ്ടിയിട്ട് പരമാവധി പ്രയോജനപ്പെടുത്തുക. 
                            </span>
                        </div>
                    </div>
                    
                    {/* Bottom Copyright Bar */}
                    <div className="bg-purple-950 py-2 text-center">
                        <p className="text-purple-300 text-xs">
                            © 2026 Santa Maria Tuition Centre | All Rights Reserved | Empowering Education
                        </p>
                    </div>
                </footer>

                <Toaster position="top-right" />
            </div>
        </AuthProvider>
    )
}

export default App