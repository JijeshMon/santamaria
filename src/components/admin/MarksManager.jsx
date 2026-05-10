import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'
import { BookOpen, Plus, Trash2, TrendingUp, Award, Calendar, User, FileText, BarChart3, CheckCircle } from 'lucide-react'

const MarksManager = () => {
    const [students, setStudents] = useState([])
    const [selectedStudent, setSelectedStudent] = useState('')
    const [selectedStudentName, setSelectedStudentName] = useState('')
    const [formData, setFormData] = useState({
        subject: '',
        test_name: '',
        marks_obtained: '',
        total_marks: '',
        test_date: new Date().toISOString().split('T')[0]
    })
    const [marksHistory, setMarksHistory] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadStudents()
    }, [])

    useEffect(() => {
        if (selectedStudent) {
            loadMarksHistory()
            // Find and set student name
            const student = students.find(s => s.id === selectedStudent)
            setSelectedStudentName(student?.name || '')
        }
    }, [selectedStudent, students])

    const loadStudents = async () => {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('name')

        if (!error && data) {
            setStudents(data)
        }
    }

    const loadMarksHistory = async () => {
        const { data, error } = await supabase
            .from('marks')
            .select('*')
            .eq('student_id', selectedStudent)
            .order('test_date', { ascending: false })

        if (!error && data) {
            setMarksHistory(data)
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        
        const { error } = await supabase
            .from('marks')
            .insert([{
                student_id: selectedStudent,
                ...formData,
                marks_obtained: parseFloat(formData.marks_obtained),
                total_marks: parseFloat(formData.total_marks)
            }])

        if (error) {
            toast.error('Error adding marks: ' + error.message)
        } else {
            toast.success('Marks added successfully!')
            setFormData({
                subject: '',
                test_name: '',
                marks_obtained: '',
                total_marks: '',
                test_date: new Date().toISOString().split('T')[0]
            })
            loadMarksHistory()
        }
        setLoading(false)
    }

    const calculatePercentage = (obtained, total) => {
        return ((obtained / total) * 100).toFixed(1)
    }

    const getPercentageColor = (percentage) => {
        if (percentage >= 80) return 'text-green-600'
        if (percentage >= 60) return 'text-blue-600'
        if (percentage >= 40) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getGrade = (percentage) => {
        if (percentage >= 90) return 'A+'
        if (percentage >= 80) return 'A'
        if (percentage >= 70) return 'B+'
        if (percentage >= 60) return 'B'
        if (percentage >= 50) return 'C+'
        if (percentage >= 40) return 'C'
        return 'D'
    }

    const calculateAverage = () => {
        if (marksHistory.length === 0) return 0
        const total = marksHistory.reduce((sum, mark) => 
            sum + ((mark.marks_obtained / mark.total_marks) * 100), 0)
        return (total / marksHistory.length).toFixed(1)
    }

    const subjectsList = [...new Set(marksHistory.map(m => m.subject))]

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div>
                <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-xl">
                        <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                        Manage Test Marks
                    </h2>
                </div>
                <p className="text-gray-500 text-sm ml-12">Record and track student test performance</p>
            </div>

            {/* Student Selection Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-2 text-purple-500" />
                    Select Student
                </label>
                <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white"
                >
                    <option value="">Choose a student from the list</option>
                    {students.map(student => (
                        <option key={student.id} value={student.id}>
                            {student.name} - {student.class}
                        </option>
                    ))}
                </select>
            </div>

            {selectedStudent && (
                <>
                    {/* Student Info & Stats */}
                    <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-500 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0" style={{ 
                                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)',
                                backgroundSize: '40px 40px'
                            }}></div>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Award className="h-6 w-6 text-yellow-300" />
                                        <h3 className="text-xl font-bold">{selectedStudentName}</h3>
                                    </div>
                                    <p className="text-purple-200 text-sm">Performance Overview</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{marksHistory.length}</p>
                                        <p className="text-xs text-purple-200">Tests Taken</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{calculateAverage()}%</p>
                                        <p className="text-xs text-purple-200">Average Score</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{subjectsList.length}</p>
                                        <p className="text-xs text-purple-200">Subjects</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add Marks Form */}
                    <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
                            <h3 className="text-lg font-semibold text-purple-800 flex items-center">
                                <Plus className="h-5 w-5 mr-2" />
                                Add New Test Marks
                            </h3>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Subject
                                    </label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                                        required
                                    >
                                        <option value="">Select Subject</option>
                                        <option value="Mathematics">Mathematics</option>
                                        <option value="Science">Science</option>
                                        <option value="English">English</option>
                                        <option value="Hindi">Hindi</option>
                                        <option value="Social Studies">Social Studies</option>
                                        <option value="Computer Science">Computer Science</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Test Name
                                    </label>
                                    <select
                                        name="test_name"
                                        value={formData.test_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                                        required
                                    >
                                        <option value="">Select Test Type</option>
                                        <option value="Unit Test 1">Unit Test 1</option>
                                        <option value="Unit Test 2">Unit Test 2</option>
                                        <option value="Quarterly Exam">Quarterly Exam</option>
                                        <option value="Half Yearly Exam">Half Yearly Exam</option>
                                        <option value="Pre-Board Exam">Pre-Board Exam</option>
                                        <option value="Final Exam">Final Exam</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Marks Obtained
                                    </label>
                                    <input
                                        type="number"
                                        name="marks_obtained"
                                        value={formData.marks_obtained}
                                        onChange={handleChange}
                                        placeholder="e.g., 85"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Total Marks
                                    </label>
                                    <input
                                        type="number"
                                        name="total_marks"
                                        value={formData.total_marks}
                                        onChange={handleChange}
                                        placeholder="e.g., 100"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Calendar className="inline h-4 w-4 mr-2 text-purple-500" />
                                        Test Date
                                    </label>
                                    <input
                                        type="date"
                                        name="test_date"
                                        value={formData.test_date}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                                        required
                                    />
                                </div>

                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                <span>Adding...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="h-5 w-5" />
                                                <span>Add Marks</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Marks History Table */}
                    {marksHistory.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
                                <h3 className="text-lg font-semibold text-purple-800 flex items-center">
                                    <BarChart3 className="h-5 w-5 mr-2" />
                                    Marks History
                                </h3>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-purple-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Test</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Subject</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Marks</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Percentage</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {marksHistory.map((mark, index) => {
                                            const percentage = calculatePercentage(mark.marks_obtained, mark.total_marks)
                                            const grade = getGrade(percentage)
                                            return (
                                                <tr key={mark.id} className={`hover:bg-purple-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                    <td className="px-6 py-4 text-gray-600">{mark.test_date}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                            {mark.test_name}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-800">{mark.subject}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-semibold text-purple-600">{mark.marks_obtained}</span>
                                                        <span className="text-gray-400">/{mark.total_marks}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                                <div 
                                                                    className="bg-purple-600 rounded-full h-2" 
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className={`font-semibold ${getPercentageColor(percentage)}`}>
                                                                {percentage}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                                                            grade === 'A+' ? 'bg-green-100 text-green-700' :
                                                            grade === 'A' ? 'bg-blue-100 text-blue-700' :
                                                            grade === 'B+' ? 'bg-teal-100 text-teal-700' :
                                                            grade === 'B' ? 'bg-cyan-100 text-cyan-700' :
                                                            grade === 'C+' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                            {grade}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default MarksManager