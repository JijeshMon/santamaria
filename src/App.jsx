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
            <div className="min-h-screen bg-gray-100">
                <Navbar />
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
                <Toaster position="top-right" />
            </div>
        </AuthProvider>
    )
}

export default App