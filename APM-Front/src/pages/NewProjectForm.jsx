import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faProjectDiagram, faAlignLeft, faUserTie, faUsers, faPlus, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import './NewProjectForm.css';

const NewProjectForm = () => {
    const navigate = useNavigate();
    
    // Sample students data
    const allStudents = [
        "أحمد محمد", "سارة عبدالله", "خالد علي", 
        "نورا أحمد", "ياسر خالد", "فاطمة عبدالعزيز",
        "سعيد ناصر", "ريم خالد", "عبدالرحمن سليمان",
        "مها عادل", "وليد حسن", "هند وسام"
    ];
    
    // State management
    const [formData, setFormData] = useState({
        projectName: '',
        projectDesc: '',
        supervisor: ''
    });
    
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // Handle student search input
    const handleStudentSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setShowSuggestions(term.length > 0);
    };
    
    // Add student to the list
    const addStudent = (student) => {
        if (!selectedStudents.includes(student)) {
            setSelectedStudents(prev => [...prev, student]);
        }
        setSearchTerm('');
        setShowSuggestions(false);
    };
    
    // Remove student from the list
    const removeStudent = (student) => {
        setSelectedStudents(prev => prev.filter(name => name !== student));
    };
    
    // Filter students based on search term
    const getFilteredStudents = () => {
        return allStudents.filter(student => 
            student.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !selectedStudents.includes(student)
        );
    };
    
    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.projectName || !formData.projectDesc || !formData.supervisor) {
            alert('الرجاء تعبئة جميع الحقول المطلوبة');
            return;
        }
        
        // Here you would typically send data to server
        console.log('Project Data:', {
            name: formData.projectName,
            description: formData.projectDesc, 
            supervisor: formData.supervisor,
            students: selectedStudents
        });
        
        // Show success message and reset form (or redirect)
        alert('تم إنشاء المشروع بنجاح!');
        resetForm();
    };
    
    // Handle cancel
    const handleCancel = () => {
        if (confirm('هل أنت متأكد أنك تريد إلغاء إنشاء المشروع؟ سيتم فقدان جميع البيانات المدخلة.')) {
            resetForm();
            navigate(-1); // Go back to previous page
        }
    };
    
    // Reset form
    const resetForm = () => {
        setFormData({
            projectName: '',
            projectDesc: '',
            supervisor: ''
        });
        setSelectedStudents([]);
        setSearchTerm('');
    };
    
    return (
        <div className="new-project-container">
            <header className="primary-bg">
                <div className="header-container">
                    <h1>إنشاء مشروع جديد</h1>
                    <div className="profile-actions">
                        <div className="profile-img-container">
                            <img src="https://via.placeholder.com/40" alt="Profile" className="profile-img" />
                        </div>
                    </div>
                </div>
            </header>
            
            <main>
                <div className="project-card fade-in">
                    <div className="project-header">
                        <h2>معلومات المشروع الأساسية</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="project-form">
                        <div className="form-group">
                            <label htmlFor="projectName">
                                <FontAwesomeIcon icon={faProjectDiagram} className="icon" /> اسم المشروع
                            </label>
                            <input 
                                type="text" 
                                id="projectName" 
                                name="projectName"
                                value={formData.projectName}
                                onChange={handleInputChange}
                                placeholder="أدخل اسم المشروع هنا..." 
                                required 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="projectDesc">
                                <FontAwesomeIcon icon={faAlignLeft} className="icon" /> وصف المشروع
                            </label>
                            <textarea 
                                id="projectDesc" 
                                name="projectDesc"
                                rows="5" 
                                value={formData.projectDesc}
                                onChange={handleInputChange}
                                placeholder="أدخل وصفاً مفصلاً للمشروع..." 
                                required
                            ></textarea>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="supervisor">
                                <FontAwesomeIcon icon={faUserTie} className="icon" /> اسم المشرف
                            </label>
                            <input 
                                type="text" 
                                id="supervisor" 
                                name="supervisor"
                                value={formData.supervisor}
                                onChange={handleInputChange}
                                placeholder="أدخل اسم المشرف على المشروع..." 
                                required 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>
                                <FontAwesomeIcon icon={faUsers} className="icon" /> الطلاب المشتركين
                            </label>
                            <div className="student-search-container">
                                <input 
                                    type="text" 
                                    id="studentSearch" 
                                    value={searchTerm}
                                    onChange={handleStudentSearch}
                                    placeholder="ابحث عن طلاب لإضافتهم للمشروع..." 
                                />
                                <button 
                                    type="button" 
                                    id="addStudentBtn" 
                                    className="add-student-btn"
                                    onClick={() => {
                                        if (allStudents.includes(searchTerm)) {
                                            addStudent(searchTerm);
                                        }
                                    }}
                                >
                                    <FontAwesomeIcon icon={faPlus} /> إضافة
                                </button>
                            </div>
                            
                            <div id="suggestions" className={`suggestions-container ${showSuggestions ? 'show' : ''}`}>
                                <h4>اقتراحات:</h4>
                                <div id="suggestionList" className="suggestion-list">
                                    {getFilteredStudents().map(student => (
                                        <button
                                            key={student}
                                            type="button"
                                            className="suggestion-btn"
                                            onClick={() => addStudent(student)}
                                        >
                                            {student}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="students-container">
                                <h4>الطلاب المضافين:</h4>
                                <div id="studentsList" className="students-list">
                                    {selectedStudents.length > 0 ? (
                                        selectedStudents.map(student => (
                                            <div key={student} className="student-tag">
                                                <button 
                                                    type="button"
                                                    className="remove-btn"
                                                    onClick={() => removeStudent(student)}
                                                >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                                <span className="student-name">{student}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p id="noStudents" className="no-students">لم يتم إضافة أي طلاب حتى الآن</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="form-actions">
                            <button 
                                type="button" 
                                id="cancelBtn" 
                                className="cancel-btn"
                                onClick={handleCancel}
                            >
                                <FontAwesomeIcon icon={faTimes} className="icon" /> إلغاء
                            </button>
                            <button type="submit" className="submit-btn">
                                <FontAwesomeIcon icon={faCheck} className="icon" /> إنشاء المشروع
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default NewProjectForm;