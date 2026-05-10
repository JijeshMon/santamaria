import React, { useState } from 'react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'
import { UserPlus, User, GraduationCap, Phone, DollarSign, Sparkles, CheckCircle, Calendar, UserCircle, Users, AlertCircle, Info } from 'lucide-react'

const StudentRegistration = () => {
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        class: '',
        parent_mobile: '',
        monthly_fee: '',
        joining_date: new Date().toISOString().split('T')[0]
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const calculateTotalFee = () => {
        if (!formData.monthly_fee || !formData.joining_date) return 0
        
        const joiningDate = new Date(formData.joining_date)
        const currentDate = new Date()
        
        // If joining date is in the future, fee is 0
        if (joiningDate > currentDate) return 0
        
        // Calculate months difference
        let months = (currentDate.getFullYear() - joiningDate.getFullYear()) * 12
        months += currentDate.getMonth() - joiningDate.getMonth()
        
        // Fee starts from the next month after joining
        // So if joined in May, fee starts from June
        if (months <= 0) return 0
        
        return parseFloat(formData.monthly_fee) * months
    }

    const getMonthsCount = () => {
        if (!formData.joining_date) return 0
        
        const joiningDate = new Date(formData.joining_date)
        const currentDate = new Date()
        
        if (joiningDate > currentDate) return 0
        
        let months = (currentDate.getFullYear() - joiningDate.getFullYear()) * 12
        months += currentDate.getMonth() - joiningDate.getMonth()
        
        return months <= 0 ? 0 : months
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Check if parent exists, if not create
            let { data: parentUser } = await supabase
                .from('users')
                .select('id')
                .eq('mobile_number', formData.parent_mobile)
                .single()

            if (!parentUser) {
                const { data: newParent, error: parentError } = await supabase
                    .from('users')
                    .insert([{ 
                        mobile_number: formData.parent_mobile, 
                        role: 'parent',
                        full_name: 'Parent',
                        password: 'password123'
                    }])
                    .select()
                    .single()

                if (parentError) throw parentError
                parentUser = newParent
            }

            // Calculate total fee based on monthly fee and joining date
            const totalFee = calculateTotalFee()
            const monthsCount = getMonthsCount()

            // Register student
            const { error: studentError } = await supabase
                .from('students')
                .insert([{
                    name: formData.name,
                    gender: formData.gender,
                    class: formData.class,
                    parent_mobile: formData.parent_mobile,
                    parent_id: parentUser.id,
                    monthly_fee: parseFloat(formData.monthly_fee),
                    total_fees: totalFee,
                    joining_date: formData.joining_date,
                    last_fee_update: new Date().toISOString().split('T')[0]
                }])

            if (studentError) throw studentError

            toast.success('Student registered successfully!')
            setFormData({
                name: '',
                gender: '',
                class: '',
                parent_mobile: '',
                monthly_fee: '',
                joining_date: new Date().toISOString().split('T')[0]
            })
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-xl">
                        <UserPlus className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                        Register New Student
                    </h2>
                </div>
                <p className="text-gray-500 text-sm ml-12">Add a new student to the system</p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 md:p-8 space-y-6">
                        {/* Student Name Field */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <User className="inline h-4 w-4 mr-2 text-purple-500" />
                                Student Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter student's full name"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                                required
                            />
                        </div>

                        {/* Gender Field with UserCircle Icons */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Users className="inline h-4 w-4 mr-2 text-purple-500" />
                                Gender
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, gender: 'Male'})}
                                    className={`relative flex flex-col items-center justify-center space-y-2 px-6 py-4 rounded-xl border-2 transition-all duration-300 ${
                                        formData.gender === 'Male' 
                                            ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 shadow-md' 
                                            : 'border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50'
                                    }`}
                                >
                                    <UserCircle className={`h-12 w-12 transition-all duration-300 ${
                                        formData.gender === 'Male' 
                                            ? 'text-purple-600 scale-110' 
                                            : 'text-blue-500'
                                    }`} />
                                    <span className="font-semibold text-sm md:text-base">Male</span>
                                    {formData.gender === 'Male' && (
                                        <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-purple-600" />
                                    )}
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, gender: 'Female'})}
                                    className={`relative flex flex-col items-center justify-center space-y-2 px-6 py-4 rounded-xl border-2 transition-all duration-300 ${
                                        formData.gender === 'Female' 
                                            ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 shadow-md' 
                                            : 'border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50'
                                    }`}
                                >
                                    <UserCircle className={`h-12 w-12 transition-all duration-300 ${
                                        formData.gender === 'Female' 
                                            ? 'text-purple-600 scale-110' 
                                            : 'text-pink-500'
                                    }`} />
                                    <span className="font-semibold text-sm md:text-base">Female</span>
                                    {formData.gender === 'Female' && (
                                        <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-purple-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Class Field */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <GraduationCap className="inline h-4 w-4 mr-2 text-purple-500" />
                                Class
                            </label>
                            <select
                                name="class"
                                value={formData.class}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white"
                                required
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
                        </div>

                        {/* Parent Mobile Number Field */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Phone className="inline h-4 w-4 mr-2 text-purple-500" />
                                Parent Mobile Number
                            </label>
                            <input
                                type="tel"
                                name="parent_mobile"
                                value={formData.parent_mobile}
                                onChange={handleChange}
                                placeholder="Enter parent's mobile number"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                                required
                            />
                            <p className="text-xs text-gray-400 mt-1">Parent account will be auto-created with password: password123</p>
                        </div>

                        {/* Monthly Fee Field */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <DollarSign className="inline h-4 w-4 mr-2 text-purple-500" />
                                Monthly Fee (₹)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                                <input
                                    type="number"
                                    name="monthly_fee"
                                    value={formData.monthly_fee}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Monthly fee amount</p>
                        </div>

                        {/* Joining Date Field */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Calendar className="inline h-4 w-4 mr-2 text-purple-500" />
                                Joining Date
                            </label>
                            <input
                                type="date"
                                name="joining_date"
                                value={formData.joining_date}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                                required
                            />
                        </div>

                        {/* Fee Preview */}
                        {formData.monthly_fee && formData.joining_date && (
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="text-sm text-purple-700 font-semibold">Fee Calculation Preview</p>
                                        <p className="text-xs text-purple-600">Fee starts from next month after joining</p>
                                    </div>
                                    <Info className="h-5 w-5 text-purple-500" />
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Monthly Fee:</span>
                                        <span className="font-semibold text-purple-700">₹{formData.monthly_fee}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Months Completed:</span>
                                        <span className="font-semibold text-purple-700">{getMonthsCount()} months</span>
                                    </div>
                                    <div className="border-t border-purple-200 pt-2 mt-2">
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-gray-700">Total Fee:</span>
                                            <span className="text-xl font-bold text-purple-700">₹{calculateTotalFee()}</span>
                                        </div>
                                        {getMonthsCount() === 0 && (
                                            <p className="text-xs text-orange-600 mt-2">
                                                ⚠️ No fee calculated yet. Fee will start from next month after joining date.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Form Actions */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Registering...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-5 w-5" />
                                        <span>Register Student</span>
                                    </>
                                )}
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => setFormData({
                                    name: '',
                                    gender: '',
                                    class: '',
                                    parent_mobile: '',
                                    monthly_fee: '',
                                    joining_date: new Date().toISOString().split('T')[0]
                                })}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </form>

                {/* Info Banner */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 border-t border-purple-200">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-purple-800">
                            <p className="font-semibold mb-1">Fee Calculation Rules:</p>
                            <ul className="text-xs space-y-1 list-disc list-inside">
                                <li>Fee is calculated from the <strong>next month</strong> after joining date</li>
                                <li>Example: Joined on 10/05/2026 → Fee starts from 01/06/2026</li>
                                <li>No fee is charged for the joining month</li>
                                <li>Total fee = Monthly fee × Number of completed months</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StudentRegistration