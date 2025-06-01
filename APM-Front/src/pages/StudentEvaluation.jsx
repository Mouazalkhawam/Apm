import React, { useState } from 'react';
import './StudentEvaluation.css';

const StudentEvaluation = () => {
  const [activeTab, setActiveTab] = useState('students-evaluation');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [workQuality, setWorkQuality] = useState(0);
  const [technicalSupport, setTechnicalSupport] = useState(0);
  
  // حالة جديدة لإدارة قيم النماذج
  const [formValues, setFormValues] = useState({
    teamwork: '',
    deadlines: '',
    initiative: '',
    comments: '',
    supervisionQuality: '',
    feedback: '',
    availability: '',
    supervisorComments: ''
  });

  const students = {
    'student1': { name: 'أحمد محمد', role: 'مبرمج الواجهة الأمامية' },
    'student2': { name: 'ريم خالد', role: 'مبرمج الواجهة الخلفية' },
    'student3': { name: 'سامي علي', role: 'مصمم الواجهات' },
    'student4': { name: 'لينا وائل', role: 'كاتب الوثائق' }
  };

  const supervisors = {
    'supervisor1': { name: 'د. محمد حسن', department: 'قسم علوم الحاسوب' },
    'supervisor2': { name: 'د. أحمد علي', department: 'قسم تقنية المعلومات' },
    'supervisor3': { name: 'أ. سارة عبدالله', department: 'قسم هندسة البرمجيات' }
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudent(studentId);
    setSelectedSupervisor(null);
  };

  const handleSupervisorSelect = (supervisorId) => {
    setSelectedSupervisor(supervisorId);
    setSelectedStudent(null);
  };

  const handleRatingSelect = (value, setter) => {
    setter(value);
  };

  // معالج جديد لتغيير القيم
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    alert('تم إرسال تقييم الطالب بنجاح. شكرًا لك!');
    setFormValues({
      teamwork: '',
      deadlines: '',
      initiative: '',
      comments: '',
      supervisionQuality: '',
      feedback: '',
      availability: '',
      supervisorComments: ''
    });
    setWorkQuality(0);
    setSelectedStudent(null);
  };

  const handleSupervisorSubmit = (e) => {
    e.preventDefault();
    alert('تم إرسال تقييم المشرف بنجاح. شكرًا لك!');
    setFormValues({
      teamwork: '',
      deadlines: '',
      initiative: '',
      comments: '',
      supervisionQuality: '',
      feedback: '',
      availability: '',
      supervisorComments: ''
    });
    setTechnicalSupport(0);
    setSelectedSupervisor(null);
  };

  return (
    <div className="evaluation-system">
      <header>
        <h1>نظام تقييم المشاريع الطلابية</h1>
        <p>تقييم زملائك والمشرفين وفق المعايير المحددة</p>
      </header>

      <div className="container">
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'students-evaluation' ? 'active' : ''}`}
            onClick={() => setActiveTab('students-evaluation')}
          >
            تقييم الطلاب
          </button>
          <button 
            className={`tab-btn ${activeTab === 'supervisor-evaluation' ? 'active' : ''}`}
            onClick={() => setActiveTab('supervisor-evaluation')}
          >
            تقييم المشرفين
          </button>
        </div>

        <div className={`tab-content ${activeTab === 'students-evaluation' ? 'active' : ''}`} id="students-evaluation">
          <h2 style={{ color: 'var(--gold)', marginBottom: '1.5rem', textAlign: 'center' }}>تقييم الطلاب المشاركين</h2>
          
          <div className="students-list">
            {Object.entries(students).map(([id, student]) => (
              <div className="student-card" key={id}>
                <div className="student-name">{student.name}</div>
                <div className="student-role">{student.role}</div>
                <button className="btn btn-gold" onClick={() => handleStudentSelect(id)}>تقييم</button>
              </div>
            ))}
          </div>

          {selectedStudent && (
            <div id="student-evaluation-form">
              <div className="evaluation-card gold-theme">
                <h3 className="card-title">
                  <span>تقييم الطالب: {students[selectedStudent].name}</span>
                </h3>
                
                <form id="student-evaluation" onSubmit={handleStudentSubmit}>
                  <div className="evaluation-item">
                    <label htmlFor="teamwork" className="evaluation-label">مستوى التعاون والعمل الجماعي</label>
                    <select 
                      id="teamwork" 
                      className="select-box" 
                      name="teamwork"
                      value={formValues.teamwork}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">اختر التقييم</option>
                      <option value="5">ممتاز - التعاون دائمًا وبناء</option>
                      <option value="4">جيد جدًا - متعاون معظم الوقت</option>
                      <option value="3">جيد - تعاون بشكل مقبول</option>
                      <option value="2">ضعيف - يحتاج لتحسين</option>
                      <option value="1">سيء - عدم تعاون</option>
                    </select>
                  </div>

                  <div className="evaluation-item">
                    <label className="evaluation-label">جودة العمل المقدم</label>
                    <div className="rating-container">
                      <div className="rating-options">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <div 
                            key={value}
                            className={`rating-option ${workQuality >= value ? 'selected' : ''}`}
                            onClick={() => handleRatingSelect(value, setWorkQuality)}
                          >
                            {value}
                          </div>
                        ))}
                      </div>
                      <span>من 5</span>
                      <input type="hidden" id="work-quality" value={workQuality} required />
                    </div>
                  </div>

                  <div className="evaluation-item">
                    <label htmlFor="deadlines" className="evaluation-label">الإلتزام بالمواعيد النهائية</label>
                    <select 
                      id="deadlines" 
                      className="select-box" 
                      name="deadlines"
                      value={formValues.deadlines}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">اختر التقييم</option>
                      <option value="5">دائمًا يلتزم بالمواعيد</option>
                      <option value="4">غالبًا يلتزم بالمواعيد</option>
                      <option value="3">أحيانًا يتأخر قليلاً</option>
                      <option value="2">غالبًا يتأخر</option>
                      <option value="1">دائمًا يتأخر</option>
                    </select>
                  </div>

                  <div className="evaluation-item">
                    <label htmlFor="initiative" className="evaluation-label">المبادرة وتحمل المسؤولية</label>
                    <select 
                      id="initiative" 
                      className="select-box" 
                      name="initiative"
                      value={formValues.initiative}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">اختر التقييم</option>
                      <option value="5">قائد ويمتلك روح المبادرة</option>
                      <option value="4">يظهر مبادرات جيدة</option>
                      <option value="3">يقوم بما يُطلب منه</option>
                      <option value="2">يحتاج للتوجيه المستمر</option>
                      <option value="1">غير مسؤول</option>
                    </select>
                  </div>

                  <div className="evaluation-item">
                    <label htmlFor="comments" className="evaluation-label">ملاحظات إضافية</label>
                    <textarea 
                      id="comments" 
                      name="comments"
                      value={formValues.comments}
                      onChange={handleInputChange}
                      placeholder="أي ملاحظات إضافية أو نقاط تستحق التقدير..."
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-gold">إرسال التقييم</button>
                </form>
              </div>
            </div>
          )}
        </div>

        <div className={`tab-content ${activeTab === 'supervisor-evaluation' ? 'active' : ''}`} id="supervisor-evaluation">
          <h2 style={{ color: 'var(--purple)', marginBottom: '1.5rem', textAlign: 'center' }}>تقييم المشرفين على المشروع</h2>
          
          <div className="supervisors-list">
            {Object.entries(supervisors).map(([id, supervisor]) => (
              <div className="supervisor-card" key={id}>
                <div className="supervisor-name">{supervisor.name}</div>
                <div className="supervisor-department">{supervisor.department}</div>
                <button className="btn btn-purple" onClick={() => handleSupervisorSelect(id)}>تقييم المشرف</button>
              </div>
            ))}
          </div>

          {selectedSupervisor && (
            <div id="supervisor-evaluation-form">
              <div className="evaluation-card purple-theme">
                <h3 className="card-title">
                  <span>تقييم المشرف: {supervisors[selectedSupervisor].name}</span>
                </h3>
                
                <form id="supervisor-evaluation-form-content" onSubmit={handleSupervisorSubmit}>
                  <div className="evaluation-item">
                    <label htmlFor="supervision-quality" className="evaluation-label">جودة الإشراف والمتابعة</label>
                    <select 
                      id="supervision-quality" 
                      className="select-box" 
                      name="supervisionQuality"
                      value={formValues.supervisionQuality}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">اختر التقييم</option>
                      <option value="5">إشراف ممتاز ومتابعة دقيقة</option>
                      <option value="4">إشراف جيد جدًا</option>
                      <option value="3">إشراف جيد</option>
                      <option value="2">إشراف مقبول</option>
                      <option value="1">إشراف ضعيف</option>
                    </select>
                  </div>

                  <div className="evaluation-item">
                    <label className="evaluation-label">الدعم الفني المقدم</label>
                    <div className="rating-container">
                      <div className="rating-options">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <div 
                            key={value}
                            className={`rating-option ${technicalSupport >= value ? 'selected' : ''}`}
                            onClick={() => handleRatingSelect(value, setTechnicalSupport)}
                          >
                            {value}
                          </div>
                        ))}
                      </div>
                      <span>من 5</span>
                      <input type="hidden" id="technical-support" value={technicalSupport} required />
                    </div>
                  </div>

                  <div className="evaluation-item">
                    <label htmlFor="feedback" className="evaluation-label">جودة الملاحظات والتغذية الراجعة</label>
                    <select 
                      id="feedback" 
                      className="select-box" 
                      name="feedback"
                      value={formValues.feedback}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">اختر التقييم</option>
                      <option value="5">ملاحظات بناءة وقيمة للغاية</option>
                      <option value="4">ملاحظات جيدة ومفيدة</option>
                      <option value="3">ملاحظات مقبولة</option>
                      <option value="2">ملاحظات سطحية</option>
                      <option value="1">لا توجد ملاحظات</option>
                    </select>
                  </div>

                  <div className="evaluation-item">
                    <label htmlFor="availability" className="evaluation-label">التوافر والاستجابة</label>
                    <select 
                      id="availability" 
                      className="select-box" 
                      name="availability"
                      value={formValues.availability}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">اختر التقييم</option>
                      <option value="5">دائمًا متاح ومستجيب بسرعة</option>
                      <option value="4">غالبًا متاح</option>
                      <option value="3">متاح في الأوقات المتفق عليها</option>
                      <option value="2">أحيانًا غير متاح</option>
                      <option value="1">صعب التواصل معه</option>
                    </select>
                  </div>

                  <div className="evaluation-item">
                    <label htmlFor="supervisor-comments" className="evaluation-label">ملاحظات إضافية</label>
                    <textarea 
                      id="supervisor-comments" 
                      name="supervisorComments"
                      value={formValues.supervisorComments}
                      onChange={handleInputChange}
                      placeholder="أي ملاحظات إضافية أو اقتراحات للتحسين..."
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-purple">إرسال التقييم</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentEvaluation;