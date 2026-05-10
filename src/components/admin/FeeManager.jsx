import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'
import { DollarSign, Wallet, CreditCard, Banknote, Receipt, TrendingUp, TrendingDown, Calendar, User, Plus, CheckCircle, AlertCircle } from 'lucide-react'

const FeeManager = () => {
    const [students, setStudents] = useState([])
    const [selectedStudent, setSelectedStudent] = useState('')
    const [selectedStudentName, setSelectedStudentName] = useState('')
    const [feeData, setFeeData] = useState({
        amount_paid: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        remarks: ''
    })
    const [paymentHistory, setPaymentHistory] = useState([])
    const [studentDetails, setStudentDetails] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadStudents()
    }, [])

    useEffect(() => {
        if (selectedStudent) {
            loadStudentDetails()
            loadPaymentHistory()
            const student = students.find(s => s.id === selectedStudent)
            setSelectedStudentName(student?.name || '')
        }
    }, [selectedStudent, students])

    const loadStudents = async () => {
        // Load from the view to get dynamic fees
        const { data, error } = await supabase
            .from('student_fees_view')
            .select('id, name, class, monthly_fee, total_fees, total_paid, remaining_fees')
            .order('name')

        if (!error && data) {
            setStudents(data)
        }
    }

    const loadStudentDetails = async () => {
        // Get fresh data from view
        const { data, error } = await supabase
            .from('student_fees_view')
            .select('*')
            .eq('id', selectedStudent)
            .single()

        if (!error && data) {
            setStudentDetails(data)
        }
    }

    const loadPaymentHistory = async () => {
        const { data, error } = await supabase
            .from('fee_payments')
            .select('*')
            .eq('student_id', selectedStudent)
            .order('payment_date', { ascending: false })

        if (!error && data) {
            setPaymentHistory(data)
        }
    }

    const handleChange = (e) => {
        setFeeData({
            ...feeData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        
        // Insert payment
        const { error: insertError } = await supabase
            .from('fee_payments')
            .insert([{
                student_id: selectedStudent,
                ...feeData,
                amount_paid: parseFloat(feeData.amount_paid)
            }])

        if (insertError) {
            toast.error('Error adding payment: ' + insertError.message)
        } else {
            toast.success('Payment recorded successfully!')
            setFeeData({
                amount_paid: '',
                payment_date: new Date().toISOString().split('T')[0],
                payment_method: 'cash',
                remarks: ''
            })
            // Refresh data
            await loadStudentDetails()
            await loadPaymentHistory()
            await loadStudents()
        }
        setLoading(false)
    }

    const getPaymentMethodIcon = (method) => {
        switch(method) {
            case 'cash': return <Banknote className="h-4 w-4" />
            case 'bank_transfer': return <CreditCard className="h-4 w-4" />
            case 'upi': return <Wallet className="h-4 w-4" />
            case 'cheque': return <Receipt className="h-4 w-4" />
            default: return <DollarSign className="h-4 w-4" />
        }
    }

    const getPaymentMethodColor = (method) => {
        switch(method) {
            case 'cash': return 'bg-green-100 text-green-700'
            case 'bank_transfer': return 'bg-blue-100 text-blue-700'
            case 'upi': return 'bg-purple-100 text-purple-700'
            case 'cheque': return 'bg-orange-100 text-orange-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getPaymentMethodLabel = (method) => {
        switch(method) {
            case 'cash': return 'Cash'
            case 'bank_transfer': return 'Bank Transfer'
            case 'upi': return 'UPI'
            case 'cheque': return 'Cheque'
            default: return method
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div>
                <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-xl">
                        <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                        Fee Management
                    </h2>
                </div>
                <p className="text-gray-500 text-sm ml-12">Manage student fees and payment records</p>
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

            {selectedStudent && studentDetails && (
                <>
                    {/* Student Info Banner */}
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
                                    <h3 className="text-xl font-bold">{studentDetails.name}</h3>
                                    <p className="text-purple-200 text-sm">Class: {studentDetails.class}</p>
                                    <p className="text-purple-200 text-xs mt-1">Joined: {studentDetails.joining_date}</p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                    <p className="text-sm">Monthly Fee: ₹{studentDetails.monthly_fee}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fee Summary Cards - Using dynamic view data */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6 hover:shadow-2xl transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-purple-100 rounded-full p-3">
                                    <DollarSign className="h-6 w-6 text-purple-600" />
                                </div>
                                <TrendingUp className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500 mb-1">Total Fees</p>
                            <p className="text-3xl font-bold text-purple-600">₹{studentDetails.total_fees || 0}</p>
                            <p className="text-xs text-gray-400 mt-1">Monthly: ₹{studentDetails.monthly_fee}</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6 hover:shadow-2xl transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-green-100 rounded-full p-3">
                                    <Wallet className="h-6 w-6 text-green-600" />
                                </div>
                                <TrendingDown className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500 mb-1">Total Paid</p>
                            <p className="text-3xl font-bold text-green-600">₹{studentDetails.total_paid || 0}</p>
                            <p className="text-xs text-gray-400 mt-1">{studentDetails.payment_count || 0} payments made</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6 hover:shadow-2xl transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-orange-100 rounded-full p-3">
                                    <Receipt className="h-6 w-6 text-orange-600" />
                                </div>
                                <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500 mb-1">Remaining Balance</p>
                            <p className={`text-3xl font-bold ${studentDetails.remaining_fees === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ₹{studentDetails.remaining_fees || 0}
                            </p>
                            {studentDetails.remaining_fees === 0 && (
                                <span className="inline-flex items-center mt-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                    Fully Paid
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Payment Progress Bar */}
                    {studentDetails.total_fees > 0 && (
                        <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Payment Progress</span>
                                <span>{((studentDetails.total_paid / studentDetails.total_fees) * 100).toFixed(1)}% Complete</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                    className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full h-3 transition-all duration-500"
                                    style={{ width: `${(studentDetails.total_paid / studentDetails.total_fees) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Add Payment Form */}
                    <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
                            <h3 className="text-lg font-semibold text-purple-800 flex items-center">
                                <Plus className="h-5 w-5 mr-2" />
                                Record New Payment
                            </h3>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Amount Paid (₹)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                                        <input
                                            type="number"
                                            name="amount_paid"
                                            value={feeData.amount_paid}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Payment Date
                                    </label>
                                    <input
                                        type="date"
                                        name="payment_date"
                                        value={feeData.payment_date}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Payment Method
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['cash', 'bank_transfer', 'upi', 'cheque'].map((method) => (
                                            <button
                                                key={method}
                                                type="button"
                                                onClick={() => setFeeData({ ...feeData, payment_method: method })}
                                                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                                                    feeData.payment_method === method
                                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                        : 'border-gray-200 text-gray-500 hover:border-purple-300'
                                                }`}
                                            >
                                                {getPaymentMethodIcon(method)}
                                                <span className="text-sm capitalize">
                                                    {method === 'bank_transfer' ? 'Bank Transfer' : method}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Remarks (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="remarks"
                                        value={feeData.remarks}
                                        onChange={handleChange}
                                        placeholder="Payment notes..."
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Wallet className="h-5 w-5" />
                                            <span>Record Payment</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Payment History Table */}
                    {paymentHistory.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-purple-800 flex items-center">
                                    <Receipt className="h-5 w-5 mr-2" />
                                    Payment History
                                </h3>
                                <span className="text-sm text-purple-600">{paymentHistory.length} payments</span>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-purple-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Method</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {paymentHistory.map((payment, index) => (
                                            <tr key={payment.id} className={`hover:bg-purple-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                <td className="px-6 py-4 text-gray-600">{payment.payment_date}</td>
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-purple-600">₹{payment.amount_paid}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(payment.payment_method)}`}>
                                                        {getPaymentMethodIcon(payment.payment_method)}
                                                        <span>{getPaymentMethodLabel(payment.payment_method)}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">{payment.remarks || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-purple-50 border-t-2 border-purple-200">
                                        <tr>
                                            <td className="px-6 py-4 font-semibold text-gray-700">Total</td>
                                            <td className="px-6 py-4 font-bold text-purple-600">₹{studentDetails.total_paid}</td>
                                            <td colSpan="2"></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Info Note */}
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-purple-800">
                                <p className="font-semibold mb-1">Auto-Calculated Fees:</p>
                                <p className="text-xs">Total fees are automatically calculated based on monthly fee and joining date. No manual updates needed!</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default FeeManager