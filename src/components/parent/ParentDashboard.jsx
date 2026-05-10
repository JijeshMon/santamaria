import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { 
    Calendar, BookOpen, MessageCircle, DollarSign, CheckCircle, 
    XCircle, TrendingUp, Award, Star, Clock, ChevronLeft, ChevronRight, Users, RefreshCw 
} from 'lucide-react'

const ParentDashboard = () => {
    const { user } = useAuth()
    const [students, setStudents] = useState([])
    const [selectedStudentIndex, setSelectedStudentIndex] = useState(0)
    const [attendance, setAttendance] = useState([])
    const [marks, setMarks] = useState([])
    const [reviews, setReviews] = useState([])
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [lastUpdated, setLastUpdated] = useState(new Date())

    // Load all students for this parent
    const loadAllStudents = useCallback(async () => {
        if (!user?.mobile_number) {
            setLoading(false)
            return
        }
        
        try {
            const { data: studentsData, error: studentsError } = await supabase
                .from('students')
                .select('*')
                .eq('parent_mobile', user.mobile_number)

            if (studentsError) throw studentsError
            
            if (studentsData && studentsData.length > 0) {
                setStudents(studentsData)
                // Load data for first student
                await loadStudentData(studentsData[0].id)
            } else {
                setStudents([])
            }
        } catch (error) {
            console.error('Error loading students:', error)
        } finally {
            setLoading(false)
        }
    }, [user?.mobile_number])

    // Load data for specific student
    const loadStudentData = useCallback(async (studentId) => {
        if (!studentId) return
        
        try {
            const [attendanceRes, marksRes, reviewsRes, paymentsRes] = await Promise.all([
                supabase.from('attendance').select('*').eq('student_id', studentId).order('date', { ascending: false }).limit(10),
                supabase.from('marks').select('*').eq('student_id', studentId).order('test_date', { ascending: false }).limit(10),
                supabase.from('teacher_reviews').select('*').eq('student_id', studentId).order('review_date', { ascending: false }),
                supabase.from('fee_payments').select('*').eq('student_id', studentId).order('payment_date', { ascending: false })
            ])

            setAttendance(attendanceRes.data || [])
            setMarks(marksRes.data || [])
            setReviews(reviewsRes.data || [])
            setPayments(paymentsRes.data || [])
            setLastUpdated(new Date())
        } catch (error) {
            console.error('Error loading student data:', error)
        }
    }, [])

    // Manual refresh
    const handleRefresh = async () => {
        setRefreshing(true)
        await loadAllStudents()
        setTimeout(() => setRefreshing(false), 500)
    }

    // Initial load
    useEffect(() => {
        if (user) {
            loadAllStudents()
        }
    }, [user, loadAllStudents])

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (user && students.length > 0) {
                loadAllStudents()
            }
        }, 30000)

        return () => clearInterval(interval)
    }, [user, students.length, loadAllStudents])

    // Real-time subscription for students table
    useEffect(() => {
        if (!user?.mobile_number) return

        const studentsChannel = supabase
            .channel('students-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'students',
                    filter: `parent_mobile=eq.${user.mobile_number}`
                },
                () => {
                    loadAllStudents()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(studentsChannel)
        }
    }, [user?.mobile_number, loadAllStudents])

    // Real-time subscription for current student's related tables
    useEffect(() => {
        const currentStudentId = students[selectedStudentIndex]?.id
        if (!currentStudentId) return

        const attendanceChannel = supabase
            .channel('attendance-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance', filter: `student_id=eq.${currentStudentId}` }, () => loadStudentData(currentStudentId))
            .subscribe()

        const marksChannel = supabase
            .channel('marks-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'marks', filter: `student_id=eq.${currentStudentId}` }, () => loadStudentData(currentStudentId))
            .subscribe()

        const reviewsChannel = supabase
            .channel('reviews-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'teacher_reviews', filter: `student_id=eq.${currentStudentId}` }, () => loadStudentData(currentStudentId))
            .subscribe()

        const paymentsChannel = supabase
            .channel('payments-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fee_payments', filter: `student_id=eq.${currentStudentId}` }, () => loadStudentData(currentStudentId))
            .subscribe()

        return () => {
            supabase.removeChannel(attendanceChannel)
            supabase.removeChannel(marksChannel)
            supabase.removeChannel(reviewsChannel)
            supabase.removeChannel(paymentsChannel)
        }
    }, [students, selectedStudentIndex, loadStudentData])

    // Student navigation functions
    const nextStudent = () => {
        if (selectedStudentIndex < students.length - 1) {
            const newIndex = selectedStudentIndex + 1
            setSelectedStudentIndex(newIndex)
            loadStudentData(students[newIndex].id)
        }
    }

    const prevStudent = () => {
        if (selectedStudentIndex > 0) {
            const newIndex = selectedStudentIndex - 1
            setSelectedStudentIndex(newIndex)
            loadStudentData(students[newIndex].id)
        }
    }

    // Calculate stats
    const calculateAttendancePercentage = () => {
        if (attendance.length === 0) return 0
        const presentCount = attendance.filter(a => a.status === 'present').length
        return ((presentCount / attendance.length) * 100).toFixed(1)
    }

    const calculateTotalPaid = () => {
        return payments.reduce((sum, payment) => sum + payment.amount_paid, 0)
    }

    const calculateRemainingFee = () => {
        const currentStudent = students[selectedStudentIndex]
        if (!currentStudent) return 0
        const totalFee = currentStudent.total_fees || currentStudent.monthly_fee * 12 || 0
        const paid = calculateTotalPaid()
        return Math.max(0, totalFee - paid)
    }

    const calculateAveragePercentage = () => {
        if (marks.length === 0) return 0
        const total = marks.reduce((sum, mark) => sum + ((mark.marks_obtained / mark.total_marks) * 100), 0)
        return (total / marks.length).toFixed(1)
    }

    const getMonthlyFee = () => {
        const currentStudent = students[selectedStudentIndex]
        if (!currentStudent) return 0
        return currentStudent.monthly_fee || 0
    }

    const currentStudent = students[selectedStudentIndex]

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <div className="text-purple-600">Loading your dashboard...</div>
                </div>
            </div>
        )
    }

    if (students.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500 p-6 rounded-lg shadow-md">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="bg-purple-100 rounded-full p-3">
                                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-purple-800 font-medium">
                                No student records found associated with your mobile number. Please contact the teacher.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Refresh Button */}
            <div className="flex justify-end items-center space-x-4">
                <div className="text-xs text-gray-400">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="text-sm">Refresh</span>
                </button>
            </div>

            {/* Student Header */}
            <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-500 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{ 
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}></div>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center space-x-3">
                            <Users className="h-8 w-8 text-yellow-300" />
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">Welcome, Parent</h1>
                                <p className="text-purple-200 text-sm">You have {students.length} child(ren) enrolled</p>
                            </div>
                        </div>
                        
                        {students.length > 1 && (
                            <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                <button onClick={prevStudent} disabled={selectedStudentIndex === 0} className="disabled:opacity-50 hover:bg-white/20 rounded-full p-1 transition">
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <span className="text-sm font-semibold">
                                    {currentStudent?.name} ({selectedStudentIndex + 1}/{students.length})
                                </span>
                                <button onClick={nextStudent} disabled={selectedStudentIndex === students.length - 1} className="disabled:opacity-50 hover:bg-white/20 rounded-full p-1 transition">
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {currentStudent && (
                        <div className="mt-4 flex flex-wrap gap-3">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                <span className="text-sm">👨‍🎓 {currentStudent.name}</span>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                <span className="text-sm">📚 Class: {currentStudent.class}</span>
                            </div>
                            {currentStudent.gender && (
                                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                    <span className="text-sm">{currentStudent.gender === 'Male' ? '👦' : '👧'} {currentStudent.gender}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Child Selector Cards */}
            {students.length > 1 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {students.map((student, idx) => (
                        <button
                            key={student.id}
                            onClick={() => {
                                setSelectedStudentIndex(idx)
                                loadStudentData(student.id)
                            }}
                            className={`p-3 rounded-xl text-center transition-all duration-300 ${
                                selectedStudentIndex === idx
                                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg scale-105'
                                    : 'bg-white border border-purple-200 text-gray-700 hover:bg-purple-50'
                            }`}
                        >
                            <div className="font-semibold text-sm">{student.name}</div>
                            <div className={`text-xs ${selectedStudentIndex === idx ? 'text-purple-200' : 'text-gray-500'}`}>
                                {student.class}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-100 rounded-full p-3"><Calendar className="h-6 w-6 text-purple-600" /></div>
                        <span className="text-3xl font-bold text-purple-600">{calculateAttendancePercentage()}%</span>
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium">Attendance Rate</h3>
                    <p className="text-xs text-gray-400 mt-1">Last 10 days</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-100 rounded-full p-3"><BookOpen className="h-6 w-6 text-purple-600" /></div>
                        <span className="text-3xl font-bold text-purple-600">{marks.length}</span>
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium">Tests Taken</h3>
                    <p className="text-xs text-gray-400 mt-1">Average: {calculateAveragePercentage()}%</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-100 rounded-full p-3"><MessageCircle className="h-6 w-6 text-purple-600" /></div>
                        <span className="text-3xl font-bold text-purple-600">{reviews.length}</span>
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium">Teacher Reviews</h3>
                    <p className="text-xs text-gray-400 mt-1">Total feedback</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-100 rounded-full p-3"><DollarSign className="h-6 w-6 text-purple-600" /></div>
                        <span className="text-3xl font-bold text-purple-600">₹{getMonthlyFee()}</span>
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium">Monthly Fee</h3>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Total Paid:</span>
                            <span className="font-semibold text-green-600">₹{calculateTotalPaid()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-1">
                            <span className="text-gray-500">Remaining:</span>
                            <span className={`font-semibold ${calculateRemainingFee() === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                ₹{calculateRemainingFee()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
                <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                    <div className="bg-purple-100 rounded-full p-2 mr-3"><Calendar className="h-5 w-5 text-purple-600" /></div>
                    Recent Attendance - {currentStudent?.name}
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead><tr className="border-b-2 border-purple-100">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                        </tr></thead>
                        <tbody>
                            {attendance.slice(0, 5).map((record, index) => (
                                <tr key={record.id} className={`border-b border-gray-100 hover:bg-purple-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <td className="px-4 py-3 text-gray-700">{record.date}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                            record.status === 'present' ? 'bg-green-100 text-green-700' :
                                            record.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {record.status === 'present' && <CheckCircle className="h-3 w-3 mr-1" />}
                                            {record.status === 'absent' && <XCircle className="h-3 w-3 mr-1" />}
                                            {record.status === 'late' && <Clock className="h-3 w-3 mr-1" />}
                                            {record.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default ParentDashboard