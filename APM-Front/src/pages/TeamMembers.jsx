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
  faSearch,
  faChevronDown
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
    userId: ''
  });
  
  // States for students dropdown
  const [studentsList, setStudentsList] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState([]);
  
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
          setTeamMembers(response.data.data.map((member, index) => ({
            userId: member.userId || `member-${index}`,
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

    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          'http://127.0.0.1:8000/api/students',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          const studentsWithUserId = response.data.data.map((student, index) => ({
            ...student,
            userId: student.userId || student.id || `student-${index}`
          }));
          setStudentsList(studentsWithUserId);
          setFilteredStudents(studentsWithUserId);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
      }
    };

    fetchTeamMembers();
    fetchStudents();
    fetchRecommendations();
  }, []);

  const filterStudents = (input) => {
    if (!input) {
      setFilteredStudents(studentsList);
      return;
    }
    const filtered = studentsList.filter(student =>
      student.name.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleStudentSelect = (student) => {
    setFormData({
      memberName: student.name,
      userId: student.userId
    });
    setIsDropdownOpen(false);
  };

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
        setRecommendedStudents(response.data.data.map((student, index) => ({
          id: student.student_id || `rec-${index}`,
          userId: student.user_id || `user-${index}`,
          name: student.name,
          specialty: `GPA: ${student.gpa}`,
          skills: student.skills ? student.skills.split(', ') : [],
          experience: student.experience,
          gpa: student.gpa,
          avatar: student.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'
        })));
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to load recommendations');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    try {
      await fetchRecommendations(searchQuery);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddStudent = (student) => {
    if (!selectedStudents.some(s => s.userId === student.userId) && 
        !teamMembers.some(m => m.userId === student.userId)) {
      const updatedSelected = [...selectedStudents, student];
      setSelectedStudents(updatedSelected);
      localStorage.setItem('selectedStudents', JSON.stringify(updatedSelected));
      setIsModalOpen(true);
    }
  };

  const handleRemoveStudent = (userId) => {
    const updatedSelected = selectedStudents.filter(s => s.userId !== userId);
    setSelectedStudents(updatedSelected);
    localStorage.setItem('selectedStudents', JSON.stringify(updatedSelected));
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    if (id === 'memberName') {
      filterStudents(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const groupId = localStorage.getItem('selectedGroupId');
      const token = localStorage.getItem('access_token');
      
      const membersToAdd = [];
      
      // Add selected students from recommendations
      selectedStudents.forEach(student => {
        membersToAdd.push({
          user_id: student.userId,
          type: 'student'
        });
      });

      // Add student from dropdown if selected
      if (formData.userId) {
        membersToAdd.push({
          user_id: formData.userId,
          type: 'student'
        });
      }

      if (membersToAdd.length === 0) {
        alert('الرجاء اختيار طالب واحد على الأقل');
        return;
      }

      const response = await axios.post(
        `http://127.0.0.1:8000/api/groups/${groupId}/members`,
        {
          members: membersToAdd
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const updatedResponse = await axios.get(
          `http://127.0.0.1:8000/api/groups/${groupId}/students`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        setTeamMembers(updatedResponse.data.data.map((member, index) => ({
          userId: member.userId || `new-member-${index}`,
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
          userId: ''
        });
        setSelectedStudents([]);
        localStorage.removeItem('selectedStudents');
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
      <ProjectHeader 
        title="أعضاء المجموعة"
        description="هذا المشروع يهدف إلى تطوير نظام متكامل لإدارة مشاريع المجموعات في الجامعة، حيث يمكن توزيع المهام ومتابعة التقدم والإنجاز بشكل فعال."
        teamMembers={teamMembers.length}
        startDate="01/01/2023"
        endDate="15/06/2023"
      />
      
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
              {teamMembers.map((member, index) => (
                <div className="team-card" key={`team-member-${member.userId}-${index}`}>
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
              {recommendedStudents.map((student, index) => {
                const isSelected = selectedStudents.some(s => s.userId === student.userId);
                const isInTeam = teamMembers.some(m => m.userId === student.userId);
                
                return (
                  <div className="recommendation-card" key={`rec-${student.userId}-${index}`}>
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
                      {student.skills.slice(0, 5).map((skill, skillIndex) => (
                        <span key={`skill-${student.userId}-${skillIndex}`} className="skill-tag">{skill}</span>
                      ))}
                      {student.skills.length > 5 && (
                        <span className="skill-tag">+{student.skills.length - 5}</span>
                      )}
                    </div>
                    <button 
                      className={`invite-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleAddStudent(student)}
                      disabled={isSelected || isInTeam}
                    >
                      {isSelected ? 'تم الاختيار' : 
                       isInTeam ? 'موجود بالفعل' : 'اختيار'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">لا توجد نتائج</div>
          )}

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
                {selectedStudents.map((student, index) => (
                  <div key={`selected-${student.userId}-${index}`} className="selected-student-card">
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
                      onClick={() => handleRemoveStudent(student.userId)}
                      title="إزالة"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
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
              <div className="form-group relative">
                <label htmlFor="memberName" className="form-label">اسم الطالب</label>
                <div className="relative">
                  <input 
                    type="text" 
                    id="memberName" 
                    className="form-input pr-10" 
                    placeholder="ابحث عن اسم الطالب"
                    value={formData.memberName}
                    onChange={handleInputChange}
                    onFocus={() => setIsDropdownOpen(true)}
                  />
                  <FontAwesomeIcon 
                    icon={faChevronDown} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
                {isDropdownOpen && (
                  <div className="dropdown-list">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student, index) => (
                        <div 
                          key={`dropdown-${student.userId}-${index}`}
                          className={`dropdown-item ${teamMembers.some(m => m.userId === student.userId) ? 'disabled' : ''}`}
                          onClick={() => !teamMembers.some(m => m.userId === student.userId) && handleStudentSelect(student)}
                        >
                          {student.name}
                          {teamMembers.some(m => m.userId === student.userId) && (
                            <span className="already-member">(موجود بالفعل)</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="dropdown-item disabled">لا توجد نتائج</div>
                    )}
                  </div>
                )}
              </div>
              
              {selectedStudents.length > 0 && (
                <div className="selected-members-container">
                  <h4 className="selected-members-title">الطلاب المختارون من التوصيات:</h4>
                  <ul className="selected-members-list">
                    {selectedStudents.map((student, index) => (
                      <li key={`selected-list-${student.userId}-${index}`} className="selected-member-item">
                        {student.name} - {student.skills.slice(0, 2).join(', ')}
                        <button 
                          type="button"
                          className="remove-selected-btn"
                          onClick={() => handleRemoveStudent(student.userId)}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
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
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={selectedStudents.length === 0 && !formData.userId}
              >
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