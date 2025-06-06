import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCalendarAlt, faHourglassHalf, faEnvelope, faGraduationCap, faTasks, faUserPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import './TeamMembers.css';
import ProjectHeader from '../components/Header/ProjectHeader';
const TeamMembers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    memberName: '',
    memberEmail: '',
    memberSpecialty: '',
    memberRole: '',
    memberTasks: ''
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('تم إضافة العضو الجديد بنجاح');
    setIsModalOpen(false);
    // Reset form
    setFormData({
      memberName: '',
      memberEmail: '',
      memberSpecialty: '',
      memberRole: '',
      memberTasks: ''
    });
  };

  const teamMembers = [
    {
      id: 1,
      name: "أحمد محمد",
      role: "قائد الفريق",
      email: "ahmed@university.edu",
      specialty: "هندسة برمجيات",
      tasks: "تنسيق المشروع، تطوير الواجهة الخلفية"
    },
    {
      id: 2,
      name: "سارة الخالد",
      role: "نائب القائد",
      email: "sara@university.edu",
      specialty: "علوم الحاسب",
      tasks: "إدارة الجودة، تحليل المتطلبات"
    },
    {
      id: 3,
      name: "لمى عبدالله",
      role: "مصممة واجهات",
      email: "lama@university.edu",
      specialty: "تصميم جرافيكي",
      tasks: "تصميم الواجهة الأمامية، تجربة المستخدم"
    },
    {
      id: 4,
      name: "خالد علي",
      role: "مبرمج",
      email: "khaled@university.edu",
      specialty: "هندسة الحاسب",
      tasks: "تطوير الواجهة الأمامية، اختبار التكامل"
    },
    {
      id: 5,
      name: "فيصل ناصر",
      role: "مبرمج",
      email: "faisal@university.edu",
      specialty: "أمن المعلومات",
      tasks: "تطوير الواجهة الخلفية، الأمان"
    }
  ];

  const recommendedStudents = [
    {
      id: 1,
      name: "نورة أحمد",
      specialty: "هندسة برمجيات - السنة الثالثة",
      skills: ["Python", "Django", "SQL"],
      avatar: "https://randomuser.me/api/portraits/women/32.jpg"
    },
    {
      id: 2,
      name: "يوسف خالد",
      specialty: "تصميم جرافيكي - السنة الثانية",
      skills: ["UI/UX", "Figma", "Photoshop"],
      avatar: "https://randomuser.me/api/portraits/men/45.jpg"
    },
    {
      id: 3,
      name: "هبه سعيد",
      specialty: "علوم البيانات - السنة الرابعة",
      skills: ["Python", "Machine Learning", "Data Analysis"],
      avatar: "https://randomuser.me/api/portraits/women/65.jpg"
    }
  ];

  return (
    <div className="container-team mx-auto px-4 py-6">
         {/* Header Component */}
              <ProjectHeader 
                title=" أعضاء المجموعة"
                description="هذا المشروع يهدف إلى تطوير نظام متكامل لإدارة مشاريع المجموعات في الجامعة، حيث يمكن توزيع المهام ومتابعة التقدم والإنجاز بشكل فعال."
                teamMembers={5}
                startDate="01/01/2023"
                endDate="15/06/2023"
              />
      {/* Team Section */}
      <div className='container-team2'>
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="section-title">أعضاء الفريق</h2>
          <button 
            className="add-member-btn" 
            onClick={() => setIsModalOpen(true)}
          >
            <FontAwesomeIcon icon={faUserPlus} />
            <span className="mr-2">إضافة عضو جديد</span>
          </button>
        </div>
        
        <div className="team-grid">
          {teamMembers.map(member => (
            <div className="team-card" key={member.id}>
              <h3 className="member-name">{member.name}</h3>
              <span className="member-role">{member.role}</span>
              <div className="member-detail">
                <FontAwesomeIcon icon={faEnvelope} />
                <span>{member.email}</span>
              </div>
              <div className="member-detail">
                <FontAwesomeIcon icon={faGraduationCap} />
                <span>{member.specialty}</span>
              </div>
              <div className="member-detail">
                <FontAwesomeIcon icon={faTasks} />
                <span>{member.tasks}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Partner Search Section */}
      <div className="search-section">
        <h2 className="section-title">البحث عن شريك للمشروع</h2>
        <p className="mb-4 text-gray-600">
          يمكنك البحث عن طلاب مناسبين لضمهم لفريقك بناءً على تخصصاتهم ومهاراتهم.
        </p>
        
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="ابحث عن طريق التخصص أو المهارة..."
          />
          <button className="search-btn">بحث</button>
        </div>
        
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--primary)' }}>
          طلاب مقترحون
        </h3>
        
        <div className="recommendation-grid">
          {recommendedStudents.map(student => (
            <div className="recommendation-card" key={student.id}>
              <div className="recommendation-avatar">
                <img src={student.avatar} alt={`صورة ${student.name}`} />
              </div>
              <h4 className="recommendation-name">{student.name}</h4>
              <p className="recommendation-specialty">{student.specialty}</p>
              <div className="recommendation-skills">
                {student.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
              <button className="invite-btn">إرسال دعوة</button>
            </div>
          ))}
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
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="memberRole" className="form-label">الدور في المشروع</label>
                <select 
                  id="memberRole" 
                  className="form-input"
                  value={formData.memberRole}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">اختر الدور</option>
                  <option value="leader">قائد الفريق</option>
                  <option value="developer">مبرمج</option>
                  <option value="designer">مصمم</option>
                  <option value="analyst">محلل متطلبات</option>
                  <option value="tester">اختصاصي ضمان جودة</option>
                  <option value="other">آخر</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="memberTasks" className="form-label">المهام الموكلة</label>
                <textarea 
                  id="memberTasks" 
                  className="form-textarea" 
                  placeholder="حدد المهام التي سيقوم بها"
                  value={formData.memberTasks}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
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
    </div>
  );
};

export default TeamMembers;