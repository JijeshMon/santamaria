import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'
import { Calendar, UserCheck, UserX, Clock, Save, Users, CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react'

const AttendanceManager = () => {
    const [students, setStudents] = useState([])
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [attendance, setAttendance] = useState({})
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredStudents, setFilteredStudents] = useState([])

    useEffect(() => {
        loadStudents()
        loadExistingAttendance()
    }, [selectedDate])

    useEffect(() => {
        // Filter students based on search term
        const filtered = students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.class.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredStudents(filtered)
    }, [searchTerm, students])

    const loadStudents = async () => {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('name')

        if (!error && data) {
            setStudents(data)
            setFilteredStudents(data)
        }
    }

    const loadExistingAttendance = async () => {
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('date', selectedDate)

        if (!error && data) {
            const attendanceMap = {}
            data.forEach(record => {
                attendanceMap[record.student_id] = record.status
            })
            setAttendance(attendanceMap)
        }
    }

    const handleAttendanceChange = (studentId, status) => {
        setAttendance({
            ...attendance,
            [studentId]: status
        })
    }

    const handleSubmit = async () => {
        setLoading(true)
        
        try {
            const promises = Object.entries(attendance).map(async ([studentId, status]) => {
                const { error } = await supabase
                    .from('attendance')
                    .upsert({
                        student_id: studentId,
                        date: selectedDate,
                        status: status
                    }, {
                        onConflict: 'student_id,date'
                    })
                
                if (error) throw error
            })

            await Promise.all(promises)
            toast.success('Attendance saved successfully!')
        } catch (error) {
            toast.error('Error saving attendance: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        switch(status) {
            case 'present':
                return { icon: CheckCircle, color: 'green', bg: 'green-100', text: 'green-700' }
            case 'absent':
                return { icon: XCircle, color: 'red', bg: 'red-100', text: 'red-700' }
            case 'late':
                return { icon: AlertCircle, color: 'yellow', bg: 'yellow-100', text: 'yellow-700' }
            default:
                return { icon: Clock, color: 'gray', bg: 'gray-100', text: 'gray-500' }
        }
    }

    const getStats = () => {
        const total = filteredStudents.length
        const present = Object.values(attendance).filter(s => s === 'present').length
        const absent = Object.values(attendance).filter(s => s === 'absent').length
        const late = Object.values(attendance).filter(s => s === 'late').length
        const pending = total - Object.keys(attendance).length
        return { total, present, absent, late, pending }
    }

    const stats = getStats()

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-xl">
                            <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                            Manage Attendance
                        </h2>
                    </div>
                    <p className="text-gray-500 text-sm ml-12">Mark and track student attendance</p>
                </div>
                
                {/* Date Picker */}
                <div className="bg-white rounded-xl shadow-md border border-purple-100 p-2">
                    <div className="flex items-center space-x-2">
                        <div className="bg-purple-100 rounded-lg p-2">
                            <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-purple-500">
                    <p className="text-xs text-gray-400">Total Students</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
                    <p className="text-xs text-gray-400 mt-1">Enrolled</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
                    <p className="text-xs text-gray-400">Present</p>
                    <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                    <p className="text-xs text-green-600 mt-1">{((stats.present/stats.total)*100).toFixed(1)}%</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500">
                    <p className="text-xs text-gray-400">Absent</p>
                    <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                    <p className="text-xs text-red-600 mt-1">{((stats.absent/stats.total)*100).toFixed(1)}%</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-yellow-500">
                    <p className="text-xs text-gray-400">Late</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                    <p className="text-xs text-yellow-600 mt-1">{((stats.late/stats.total)*100).toFixed(1)}%</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-gray-400">
                    <p className="text-xs text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
                    <p className="text-xs text-gray-400 mt-1">Not marked</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by student name or class..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                />
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gradient-to-r from-purple-50 to-purple-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                                    Student Name
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                                    Class
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                                    Attendance Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStudents.map((student, index) => {
                                const status = attendance[student.id] || ''
                                const StatusIcon = status ? getStatusBadge(status).icon : Clock
                                const statusColor = status ? getStatusBadge(status).text : 'text-gray-400'
                                
                                return (
                                    <tr key={student.id} className={`hover:bg-purple-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="bg-purple-100 rounded-full p-2">
                                                    <Users className="h-4 w-4 text-purple-600" />
                                                </div>
                                                <span className="font-medium text-gray-800">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                {student.class}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <select
                                                    value={status}
                                                    onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                                                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white"
                                                >
                                                    <option value="">Select Status</option>
                                                    <option value="present">✓ Present</option>
                                                    <option value="absent">✗ Absent</option>
                                                    <option value="late">⏰ Late</option>
                                                </select>
                                                {status && (
                                                    <span className={`flex items-center space-x-1 text-xs ${statusColor}`}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        <span className="capitalize">{status}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-gray-400">
                                        <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                        <p>No students found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={loading || filteredStudents.length === 0}
                    className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none flex items-center space-x-2"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5" />
                            <span>Save Attendance</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default AttendanceManager