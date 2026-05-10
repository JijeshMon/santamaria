import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'
import { MessageCircle, Star, User, Calendar, Edit3, ThumbsUp, Award, Heart, TrendingUp, Sparkles, BookOpen, Clock, Save } from 'lucide-react'

const ReviewManager = () => {
    const [students, setStudents] = useState([])
    const [selectedStudent, setSelectedStudent] = useState('')
    const [selectedStudentName, setSelectedStudentName] = useState('')
    const [reviewDate, setReviewDate] = useState(new Date().toISOString().split('T')[0])
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(false)
    
    // Reviews for each category
    const [academicReview, setAcademicReview] = useState({ text: '', rating: 3 })
    const [behaviorReview, setBehaviorReview] = useState({ text: '', rating: 3 })
    const [attendanceReview, setAttendanceReview] = useState({ text: '', rating: 3 })
    const [participationReview, setParticipationReview] = useState({ text: '', rating: 3 })

    useEffect(() => {
        loadStudents()
    }, [])

    useEffect(() => {
        if (selectedStudent) {
            loadReviews()
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

    const loadReviews = async () => {
        const { data, error } = await supabase
            .from('teacher_reviews')
            .select('*')
            .eq('student_id', selectedStudent)
            .order('review_date', { ascending: false })

        if (!error && data) {
            setReviews(data)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        
        // Prepare all reviews (without category column)
        const allReviews = []
        
        if (academicReview.text.trim()) {
            allReviews.push({
                student_id: selectedStudent,
                review_text: `[ACADEMIC] ⭐ ${academicReview.rating}/5\n\n${academicReview.text}`,
                review_date: reviewDate
            })
        }
        
        if (behaviorReview.text.trim()) {
            allReviews.push({
                student_id: selectedStudent,
                review_text: `[BEHAVIOR] ⭐ ${behaviorReview.rating}/5\n\n${behaviorReview.text}`,
                review_date: reviewDate
            })
        }
        
        if (attendanceReview.text.trim()) {
            allReviews.push({
                student_id: selectedStudent,
                review_text: `[ATTENDANCE] ⭐ ${attendanceReview.rating}/5\n\n${attendanceReview.text}`,
                review_date: reviewDate
            })
        }
        
        if (participationReview.text.trim()) {
            allReviews.push({
                student_id: selectedStudent,
                review_text: `[PARTICIPATION] ⭐ ${participationReview.rating}/5\n\n${participationReview.text}`,
                review_date: reviewDate
            })
        }
        
        if (allReviews.length === 0) {
            toast.error('Please add at least one review')
            setLoading(false)
            return
        }
        
        // Insert all reviews
        const { error } = await supabase
            .from('teacher_reviews')
            .insert(allReviews)

        if (error) {
            toast.error('Error adding reviews: ' + error.message)
        } else {
            toast.success(`${allReviews.length} review(s) added successfully!`)
            // Reset form
            setAcademicReview({ text: '', rating: 3 })
            setBehaviorReview({ text: '', rating: 3 })
            setAttendanceReview({ text: '', rating: 3 })
            setParticipationReview({ text: '', rating: 3 })
            loadReviews()
        }
        setLoading(false)
    }

    const getRatingStars = (ratingValue, size = "h-4 w-4") => {
        const stars = []
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star 
                    key={i} 
                    className={`${size} ${i <= ratingValue ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
            )
        }
        return stars
    }

    const getReviewTypeColor = (reviewText) => {
        if (reviewText.includes('[ACADEMIC]')) return 'border-purple-500'
        if (reviewText.includes('[BEHAVIOR]')) return 'border-green-500'
        if (reviewText.includes('[ATTENDANCE]')) return 'border-blue-500'
        if (reviewText.includes('[PARTICIPATION]')) return 'border-orange-500'
        return 'border-purple-500'
    }

    const getReviewIcon = (reviewText) => {
        if (reviewText.includes('[ACADEMIC]')) return <BookOpen className="h-5 w-5 text-purple-600" />
        if (reviewText.includes('[BEHAVIOR]')) return <Heart className="h-5 w-5 text-green-600" />
        if (reviewText.includes('[ATTENDANCE]')) return <Clock className="h-5 w-5 text-blue-600" />
        if (reviewText.includes('[PARTICIPATION]')) return <TrendingUp className="h-5 w-5 text-orange-600" />
        return <MessageCircle className="h-5 w-5 text-purple-600" />
    }

    const formatReviewTitle = (reviewText) => {
        if (reviewText.includes('[ACADEMIC]')) return 'Academic Progress'
        if (reviewText.includes('[BEHAVIOR]')) return 'Behavior & Conduct'
        if (reviewText.includes('[ATTENDANCE]')) return 'Attendance Record'
        if (reviewText.includes('[PARTICIPATION]')) return 'Class Participation'
        return 'General Review'
    }

    const extractRating = (reviewText) => {
        const match = reviewText.match(/⭐ (\d)\/5/)
        return match ? parseInt(match[1]) : 3
    }

    const extractContent = (reviewText) => {
        // Extract content after the rating line
        const parts = reviewText.split('\n\n')
        return parts.length > 1 ? parts.slice(1).join('\n\n') : reviewText
    }

    const ReviewSection = ({ title, icon: Icon, color, review, setReview, bgColor }) => (
        <div className={`${bgColor} rounded-xl p-4 border-2 border-${color}-200`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <div className={`bg-${color}-100 rounded-full p-2`}>
                        <Icon className={`h-5 w-5 text-${color}-600`} />
                    </div>
                    <h4 className="font-semibold text-gray-800">{title}</h4>
                </div>
                <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setReview({ ...review, rating: star })}
                            className="focus:outline-none transform hover:scale-110 transition-transform"
                        >
                            <Star 
                                className={`h-5 w-5 ${
                                    star <= review.rating 
                                        ? 'text-yellow-400 fill-yellow-400' 
                                        : 'text-gray-300'
                                } transition-colors duration-200`}
                            />
                        </button>
                    ))}
                </div>
            </div>
            <textarea
                value={review.text}
                onChange={(e) => setReview({ ...review, text: e.target.value })}
                rows="3"
                className={`w-full px-4 py-3 border-2 border-${color}-200 rounded-xl focus:outline-none focus:border-${color}-500 focus:ring-2 focus:ring-${color}-200 transition-all duration-300 resize-none`}
                placeholder={`Write ${title.toLowerCase()} review...`}
            />
        </div>
    )

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div>
                <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-xl">
                        <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                        Teacher Reviews
                    </h2>
                </div>
                <p className="text-gray-500 text-sm ml-12">Write and track student performance reviews across all categories</p>
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
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Award className="h-6 w-6 text-yellow-300" />
                                        <h3 className="text-xl font-bold">{selectedStudentName}</h3>
                                    </div>
                                    <p className="text-purple-200 text-sm">Comprehensive Performance Review</p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                    <p className="text-sm">{reviews.length} Total Reviews</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add Review Form - All Categories */}
                    <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
                            <h3 className="text-lg font-semibold text-purple-800 flex items-center">
                                <Edit3 className="h-5 w-5 mr-2" />
                                Write Comprehensive Reviews
                            </h3>
                            <p className="text-sm text-purple-600 mt-1">Fill in all categories that apply. Each category will be saved as a separate review.</p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Review Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <Calendar className="inline h-4 w-4 mr-2 text-purple-500" />
                                    Review Date
                                </label>
                                <input
                                    type="date"
                                    value={reviewDate}
                                    onChange={(e) => setReviewDate(e.target.value)}
                                    className="w-full md:w-auto px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                                    required
                                />
                            </div>

                            {/* Academic Review Section */}
                            <ReviewSection
                                title="Academic Progress"
                                icon={BookOpen}
                                color="purple"
                                review={academicReview}
                                setReview={setAcademicReview}
                                bgColor="bg-purple-50"
                            />

                            {/* Behavior Review Section */}
                            <ReviewSection
                                title="Behavior & Conduct"
                                icon={Heart}
                                color="green"
                                review={behaviorReview}
                                setReview={setBehaviorReview}
                                bgColor="bg-green-50"
                            />

                            {/* Attendance Review Section */}
                            <ReviewSection
                                title="Attendance Record"
                                icon={Clock}
                                color="blue"
                                review={attendanceReview}
                                setReview={setAttendanceReview}
                                bgColor="bg-blue-50"
                            />

                            {/* Participation Review Section */}
                            <ReviewSection
                                title="Class Participation"
                                icon={TrendingUp}
                                color="orange"
                                review={participationReview}
                                setReview={setParticipationReview}
                                bgColor="bg-orange-50"
                            />

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Submitting Reviews...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        <span>Submit All Reviews</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Review History */}
                    {reviews.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
                                <h3 className="text-lg font-semibold text-purple-800 flex items-center">
                                    <ThumbsUp className="h-5 w-5 mr-2" />
                                    Review History ({reviews.length} reviews)
                                </h3>
                            </div>
                            
                            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                                {reviews.map((reviewItem, index) => {
                                    const ratingValue = extractRating(reviewItem.review_text)
                                    const content = extractContent(reviewItem.review_text)
                                    const reviewTitle = formatReviewTitle(reviewItem.review_text)
                                    const ReviewIcon = getReviewIcon(reviewItem.review_text)
                                    
                                    return (
                                        <div 
                                            key={reviewItem.id} 
                                            className={`border-l-4 ${getReviewTypeColor(reviewItem.review_text)} bg-white rounded-r-xl shadow-md hover:shadow-lg transition-all duration-300`}
                                        >
                                            <div className="p-5">
                                                <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="bg-purple-100 rounded-full p-2">
                                                            {ReviewIcon}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800">{reviewTitle}</h4>
                                                            <p className="text-xs text-gray-400">{reviewItem.review_date}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        {getRatingStars(ratingValue)}
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 leading-relaxed">{content}</p>
                                                {ratingValue >= 4 && (
                                                    <div className="mt-3 flex items-center space-x-1 text-green-600">
                                                        <ThumbsUp className="h-3 w-3" />
                                                        <span className="text-xs">Positive feedback</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default ReviewManager