import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'
import { 
    Users, Search, Edit2, Trash2, Save, X, Eye, 
    User, GraduationCap, Phone, DollarSign, Calendar, 
    Venus, Mars, AlertCircle, CheckCircle, RefreshCw,
    ChevronLeft, ChevronRight, Filter, Download, Printer
} from 'lucide-react'

const StudentListManager = () => {
    const [students, setStudents] = useState([])
    const [filteredStudents, setFilteredStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedClass, setSelectedClass] = useState('')
    const [selectedGender, setSelectedGender] = useState('')
    const [editingStudent, setEditingStudent] = useState(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    
    // Edit form data
    const [editFormData, setEditFormData] = useState({
        name: '',
        gender: '',
        class: '',
        parent_mobile: '',
        monthly_fee: '',
        joining_date: ''
    })

    useEffect(() => {
        loadStudents()
    }, [])

    useEffect(() => {
        filterStudents()
    }, [searchTerm, selectedClass, selectedGender, students])

    const loadStudents = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('name')

        if (!error && data) {
            setStudents(data)
            setFilteredStudents(data)
        } else {
            toast.error('Error loading students')
        }
        setLoading(false)
    }

    const filterStudents = () => {
        let filtered = [...students]
        
        if (searchTerm) {
            filtered = filtered.filter(student => 
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.parent_mobile.includes(searchTerm)
            )
        }
        
        if (selectedClass) {
            filtered = filtered.filter(student => student.class === selectedClass)
        }
        
        if (selectedGender) {
            filtered = filtered.filter(student => student.gender === selectedGender)
        }
        
        setFilteredStudents(filtered)
        setCurrentPage(1)
    }

    const handleEdit = (student) => {
        setEditingStudent(student.id)
        setEditFormData({
            name: student.name,
            gender: student.gender || '',
            class: student.class,
            parent_mobile: student.parent_mobile,
            monthly_fee: student.monthly_fee || '',
            joining_date: student.joining_date || ''
        })
    }

    const handleUpdate = async (studentId) => {
        setLoading(true)
        
        const { error } = await supabase
            .from('students')
            .update({
                name: editFormData.name,
                gender: editFormData.gender,
                class: editFormData.class,
                parent_mobile: editFormData.parent_mobile,
                monthly_fee: parseFloat(editFormData.monthly_fee) || null,
                joining_date: editFormData.joining_date
            })
            .eq('id', studentId)

        if (error) {
            toast.error('Error updating student: ' + error.message)
        } else {
            toast.success('Student updated successfully!')
            setEditingStudent(null)
            loadStudents()
        }
        setLoading(false)
    }

    const handleDelete = async (studentId) => {
        setLoading(true)
        
        // First delete related records (attendance, marks, reviews, fees)
        await supabase.from('attendance').delete().eq('student_id', studentId)
        await supabase.from('marks').delete().eq('student_id', studentId)
        await supabase.from('teacher_reviews').delete().eq('student_id', studentId)
        await supabase.from('fee_payments').delete().eq('student_id', studentId)
        
        // Then delete student
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', studentId)

        if (error) {
            toast.error('Error deleting student: ' + error.message)
        } else {
            toast.success('Student deleted successfully!')
            setShowDeleteConfirm(null)
            loadStudents()
        }
        setLoading(false)
    }

    const cancelEdit = () => {
        setEditingStudent(null)
        setEditFormData({
            name: '',
            gender: '',
            class: '',
            parent_mobile: '',
            monthly_fee: '',
            joining_date: ''
        })
    }

    // Get unique classes for filter
    const uniqueClasses = [...new Set(students.map(s => s.class))].sort()

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)

    const resetFilters = () => {
        setSearchTerm('')
        setSelectedClass('')
        setSelectedGender('')
    }

    const exportToCSV = () => {
        const headers = ['Name', 'Gender', 'Class', 'Parent Mobile', 'Monthly Fee', 'Joining Date', 'Total Fees']
        const csvData = filteredStudents.map(s => [
            s.name,
            s.gender || '-',
            s.class,
            s.parent_mobile,
            s.monthly_fee || '-',
            s.joining_date || '-',
            s.total_fees || '-'
        ])
        
        const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `students_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success('Exported to CSV!')
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div>
                <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-xl">
                        <Users className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                        Student List Manager
                    </h2>
                </div>
                <p className="text-gray-500 text-sm ml-12">View, edit, and manage all student records</p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
                    <p className="text-xs text-gray-400">Total Students</p>
                    <p className="text-2xl font-bold text-purple-600">{students.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
                    <p className="text-xs text-gray-400">Male Students</p>
                    <p className="text-2xl font-bold text-blue-600">{students.filter(s => s.gender === 'Male').length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
                    <p className="text-xs text-gray-400">Female Students</p>
                    <p className="text-2xl font-bold text-pink-600">{students.filter(s => s.gender === 'Female').length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
                    <p className="text-xs text-gray-400">Total Classes</p>
                    <p className="text-2xl font-bold text-orange-600">{uniqueClasses.length}</p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Search className="inline h-4 w-4 mr-1 text-purple-500" />
                            Search
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name or mobile..."
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                        />
                    </div>
                    
                    <div className="w-48">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <GraduationCap className="inline h-4 w-4 mr-1 text-purple-500" />
                            Class
                        </label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                        >
                            <option value="">All Classes</option>
                            {uniqueClasses.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="w-40">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Gender
                        </label>
                        <select
                            value={selectedGender}
                            onChange={(e) => setSelectedGender(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                        >
                            <option value="">All</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                    >
                        Reset Filters
                    </button>
                    
                    <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition flex items-center space-x-2"
                    >
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                    </button>
                    
                    <button
                        onClick={loadStudents}
                        className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition flex items-center space-x-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gradient-to-r from-purple-50 to-purple-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase">Gender</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase">Class</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase">Parent Mobile</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase">Monthly Fee</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase">Joining Date</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-purple-700 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                                        <p className="mt-2 text-gray-500">Loading...</p>
                                    </td>
                                </tr>
                            ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                                        <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                        <p>No students found</p>
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((student, index) => (
                                    <tr key={student.id} className={`hover:bg-purple-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                        {editingStudent === student.id ? (
                                            <>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={editFormData.name}
                                                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                                                        className="w-full px-3 py-1 border rounded-lg focus:outline-none focus:border-purple-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={editFormData.gender}
                                                        onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})}
                                                        className="w-full px-3 py-1 border rounded-lg focus:outline-none focus:border-purple-500"
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={editFormData.class}
                                                        onChange={(e) => setEditFormData({...editFormData, class: e.target.value})}
                                                        className="w-full px-3 py-1 border rounded-lg focus:outline-none focus:border-purple-500"
                                                    >
                                                        <option value="">Select Class</option>
                                                        <option value="1st Standard">1st Standard</option>
                                                        <option value="2nd Standard">2nd Standard</option>
                                                        <option value="3rd Standard">3rd Standard</option>
                                                        <option value="4th Standard">4th Standard</option>
                                                        <option value="5th Standard">5th Standard</option>
                                                        <option value="6th Standard">6th Standard</option>
                                                        <option value="7th Standard">7th Standard</option>
                                                        <option value="8th Standard">8th Standard</option>
                                                        <option value="9th Standard">9th Standard</option>
                                                        <option value="10th Standard">10th Standard</option>
                                                        <option value="11th Standard">11th Standard</option>
                                                        <option value="12th Standard">12th Standard</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="tel"
                                                        value={editFormData.parent_mobile}
                                                        onChange={(e) => setEditFormData({...editFormData, parent_mobile: e.target.value})}
                                                        className="w-full px-3 py-1 border rounded-lg focus:outline-none focus:border-purple-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="number"
                                                        value={editFormData.monthly_fee}
                                                        onChange={(e) => setEditFormData({...editFormData, monthly_fee: e.target.value})}
                                                        className="w-24 px-3 py-1 border rounded-lg focus:outline-none focus:border-purple-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="date"
                                                        value={editFormData.joining_date}
                                                        onChange={(e) => setEditFormData({...editFormData, joining_date: e.target.value})}
                                                        className="w-full px-3 py-1 border rounded-lg focus:outline-none focus:border-purple-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <button
                                                            onClick={() => handleUpdate(student.id)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                                        >
                                                            <Save className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4 font-medium text-gray-800">{student.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                        student.gender === 'Male' ? 'bg-blue-100 text-blue-700' : 
                                                        student.gender === 'Female' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {student.gender === 'Male' ? <Mars className="h-3 w-3" /> : <Venus className="h-3 w-3" />}
                                                        <span>{student.gender || 'N/A'}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                        {student.class}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{student.parent_mobile}</td>
                                                <td className="px-6 py-4 text-purple-600 font-semibold">₹{student.monthly_fee || '-'}</td>
                                                <td className="px-6 py-4 text-gray-600">{student.joining_date || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(student)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        >
                                                            <Edit2 className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setShowDeleteConfirm(student.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded-lg border disabled:opacity-50 hover:bg-gray-50 transition"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded-lg border disabled:opacity-50 hover:bg-gray-50 transition"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Student?</h3>
                            <p className="text-gray-600 mb-6">
                                This action cannot be undone. All attendance, marks, reviews, and fee records for this student will also be deleted.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleDelete(showDeleteConfirm)}
                                    className="flex-1 bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 transition"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StudentListManager