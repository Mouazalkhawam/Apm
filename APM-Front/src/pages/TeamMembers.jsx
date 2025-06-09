import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faEnvelope, 
  faGraduationCap, 
  faUserPlus, 
  faTimes, 
  faCrown,
  faCalendarAlt, 
  faHourglassHalf,
  faTasks,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import './TeamMembers.css';
import ProjectHeader from '../components/Header/ProjectHeader';
import axios from 'axios';

const TeamMembers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    memberName: '',
    memberEmail: '',
    memberSpecialty: '',
    is_leader: false
  });
  
  // States for recommendation system
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendedStudents, setRecommendedStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const groupId = localStorage.getItem('selectedGroupId');
        if (!groupId) {
          throw new Error('Group ID not found');
        }

        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          `http://127.0.0.1:8000/api/groups/${groupId}/students`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setTeamMembers(response.data.data.map(member => ({
            studentId: member.studentId,
            name: member.name,
            email: member.email,
            major: member.major,
            is_leader: member.is_leader,
            since: member.since
          })));
        } else {
          throw new Error(response.data.message || 'Failed to fetch team members');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
    fetchRecommendations(); // Load initial recommendations
  }, []);

  // Fetch recommended students from API
  const fetchRecommendations = async (query = '') => {
    setIsLoadingRecommendations(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        'http://127.0.0.1:8000/api/projects/recommendations',
        { query },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.status === 'success') {
        setRecommendedStudents(response.data.data.map(student => ({
          id: student.student_id,
          name: student.name,
          specialty: `GPA: ${student.gpa}`,
          skills: student.skills ? student.skills.split(', ') : [],
          experience: student.experience,
          gpa: student.gpa,
         /* avatar: student.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'*/
        })));
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to load recommendations');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Handle search for students
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    try {
      await fetchRecommendations(searchQuery);
    } finally {
      setSearchLoading(false);
    }
  };

  // Add student to selected list
  const handleAddStudent = (student) => {
    if (!selectedStudents.some(s => s.id === student.id)) {
      const updatedSelected = [...selectedStudents, student];
      setSelectedStudents(updatedSelected);
      localStorage.setItem('selectedStudents', JSON.stringify(updatedSelected));
    }
  };

  // Remove student from selected list
  const handleRemoveStudent = (studentId) => {
    const updatedSelected = selectedStudents.filter(s => s.id !== studentId);
    setSelectedStudents(updatedSelected);
    localStorage.setItem('selectedStudents', JSON.stringify(updatedSelected));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  // Submit new member form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const groupId = localStorage.getItem('selectedGroupId');
      const token = localStorage.getItem('access_token');
      
      const response = await axios.post(
        `http://127.0.0.1:8000/api/groups/${groupId}/students`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Refresh the members list after adding
        const updatedResponse = await axios.get(
          `http://127.0.0.1:8000/api/groups/${groupId}/students`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        setTeamMembers(updatedResponse.data.data.map(member => ({
          studentId: member.studentId,
          name: member.name,
          email: member.email,
          major: member.major,
          is_leader: member.is_leader,
          since: member.since
        })));
        
        setIsModalOpen(false);
        setFormData({
          memberName: '',
          memberEmail: '',
          memberSpecialty: '',
          is_leader: false
        });
      }
    } catch (err) {
      alert('حدث خطأ أثناء إضافة العضو: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="container-team mx-auto px-4 py-6">
        <ProjectHeader 
          title="أعضاء المجموعة"
          description="جاري تحميل بيانات أعضاء الفريق..."
        />
        <div className="text-center py-8">جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-team mx-auto px-4 py-6">  
        <ProjectHeader 
          title="أعضاء المجموعة"
          description={error}
        />
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-team mx-auto px-4 py-6">
      {/* Header Component */}
      <ProjectHeader 
        title="أعضاء المجموعة"
        description="هذا المشروع يهدف إلى تطوير نظام متكامل لإدارة مشاريع المجموعات في الجامعة، حيث يمكن توزيع المهام ومتابعة التقدم والإنجاز بشكل فعال."
        teamMembers={teamMembers.length}
        startDate="01/01/2023"
        endDate="15/06/2023"
      />
      
      {/* Team Section */}
      <div className='container-team2'>
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4 team-member">
            <h2 className="section-title-member">أعضاء الفريق</h2>
            <button 
              className="add-member-btn-member" 
              onClick={() => setIsModalOpen(true)}
            >
              <FontAwesomeIcon icon={faUserPlus} />
              <span className="mr-2">إضافة عضو جديد</span>
            </button>
          </div>
          
          {teamMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا يوجد أعضاء في هذه المجموعة بعد
            </div>
          ) : (
            <div className="team-grid">
              {teamMembers.map(member => (
                <div className="team-card" key={member.studentId}>
                  <div className="flex justify-between items-start team-member">
                    <h3 className="member-name">{member.name}</h3>
                    {member.is_leader && (
                      <span className="leader-badge">
                        <FontAwesomeIcon icon={faCrown} />
                      </span>
                    )}
                  </div>
                  <span className="member-role">
                    {member.is_leader ? 'قائد الفريق' : 'عضو في الفريق'}
                  </span>
                  <div className="member-detail">
                    <FontAwesomeIcon icon={faEnvelope} />
                    <span>{member.email}</span>
                  </div>
                  <div className="member-detail">
                    <FontAwesomeIcon icon={faGraduationCap} />
                    <span>{member.major || 'غير محدد'}</span>
                  </div>
                  <div className="member-since">
                    عضو منذ: {member.since}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Partner Search Section */}
      <div className="container-team2">
        <div className="search-section">
          <h2 className="section-title-member">البحث عن شريك للمشروع</h2>
          <p className="mb-4 text-gray-600">
            يمكنك البحث عن طلاب مناسبين لضمهم لفريقك بناءً على تخصصاتهم ومهاراتهم.
          </p>
          
          <form onSubmit={handleSearch} className="search-container-member">
            <input 
              type="text" 
              className="search-input" 
              placeholder="ابحث عن طريق التخصص أو المهارة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn" disabled={searchLoading}>
              {searchLoading ? 'جاري البحث...' : 'بحث'}
            </button>
          </form>
          
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--primary)' }}>
            طلاب مقترحون
          </h3>
          
          {isLoadingRecommendations ? (
            <div className="text-center py-4">جاري تحميل التوصيات...</div>
          ) : recommendedStudents.length > 0 ? (
            <div className="recommendation-grid">
              {recommendedStudents.map(student => (
                <div className="recommendation-card" key={student.id}>
                  <div className="recommendation-avatar">
                    <img src={student.avatar} alt={`صورة ${student.name}`} />
                  </div>
                  <h4 className="recommendation-name">{student.name}</h4>
                  <p className="recommendation-specialty">المعدل: {student.gpa}</p>
                  {student.experience && (
                    <p className="recommendation-experience">
                      <i className="fas fa-briefcase mr-1"></i>
                      {student.experience.length > 50 
                        ? `${student.experience.substring(0, 50)}...` 
                        : student.experience}
                    </p>
                  )}
                  <div className="recommendation-skills">
                    {student.skills.slice(0, 5).map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                    {student.skills.length > 5 && (
                      <span className="skill-tag">+{student.skills.length - 5}</span>
                    )}
                  </div>
                  <button 
                    className={`invite-btn ${selectedStudents.some(s => s.id === student.id) ? 'selected' : ''}`}
                    onClick={() => handleAddStudent(student)}
                    disabled={selectedStudents.some(s => s.id === student.id)}
                  >
                    {selectedStudents.some(s => s.id === student.id) ? 'تم الاختيار' : 'اختيار'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">لا توجد نتائج</div>
          )}

          {/* Selected Students Section */}
          {selectedStudents.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--primary)' }}>
                  الطلاب المختارون ({selectedStudents.length})
                </h3>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => {
                    localStorage.setItem('selectedStudents', JSON.stringify([]));
                    setSelectedStudents([]);
                  }}
                >
                  مسح الكل
                </button>
              </div>
              
              <div className="selected-students-grid">
                {selectedStudents.map(student => (
                  <div key={student.id} className="selected-student-card">
                    <div className="flex items-center">
                      <img 
                        src={student.avatar} 
                        alt={student.name} 
                        className="selected-student-avatar" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
                        }}
                      />
                      <div className="ml-3">
                        <h4 className="selected-student-name">{student.name}</h4>
                        <p className="selected-student-skills">
                          {student.skills.slice(0, 3).join(', ')}
                          {student.skills.length > 3 && '...'}
                        </p>
                      </div>
                    </div>
                    <button 
                      className="remove-student-btn"
                      onClick={() => handleRemoveStudent(student.id)}
                      title="إزالة"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <button 
                  className="btn-primary-profile"
                  onClick={() => setIsModalOpen(true)}
                >
                  <FontAwesomeIcon icon={faUserPlus} className="ml-2" />
                  الانتقال إلى إضافة الأعضاء
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Member Modal */}
      <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            إضافة عضو جديد للفريق
            <button 
              className="close-btn" 
              onClick={() => setIsModalOpen(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="memberName" className="form-label">اسم الطالب</label>
                <input 
                  type="text" 
                  id="memberName" 
                  className="form-input" 
                  placeholder="أدخل الاسم الكامل"
                  value={formData.memberName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="memberEmail" className="form-label">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  id="memberEmail" 
                  className="form-input" 
                  placeholder="أدخل البريد الجامعي"
                  value={formData.memberEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="memberSpecialty" className="form-label">التخصص</label>
                <input 
                  type="text" 
                  id="memberSpecialty" 
                  className="form-input" 
                  placeholder="أدخل التخصص"
                  value={formData.memberSpecialty}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group flex items-center">
                <input 
                  type="checkbox" 
                  id="is_leader" 
                  className="form-checkbox" 
                  checked={formData.is_leader}
                  onChange={handleInputChange}
                />
                <label htmlFor="is_leader" className="form-label mr-2">قائد الفريق</label>
              </div>
              
              {selectedStudents.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">الطلاب المختارون من التوصيات:</h4>
                  <ul className="list-disc list-inside">
                    {selectedStudents.map(student => (
                      <li key={student.id} className="text-sm">
                        {student.name} - {student.skills.slice(0, 2).join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setIsModalOpen(false)}
              >
                إلغاء
              </button>
              <button type="submit" className="btn btn-primary">
                إضافة العضو
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamMembers;