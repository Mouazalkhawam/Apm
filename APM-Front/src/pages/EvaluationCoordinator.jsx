import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { 
  faBars, 
  faGraduationCap,
  faUsers,
  faUser,
  faChartBar,
  faCalendarAlt,
  faCog,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import './EvaluationCoordinator.css';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav';

const EvaluationCoordinator = () => {
  // Existing states
  const [activeTab, setActiveTab] = useState('group');
  const [evaluationType, setEvaluationType] = useState('');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [groupScores, setGroupScores] = useState({
    criteria1: 0,
    criteria2: 0,
    criteria3: 0,
    criteria4: 0,
    criteria5: 0,
    criteria6: 0,
    criteria7: 0,
    criteria8: 0
  });
  const [individualScores, setIndividualScores] = useState({
    criteria1: 0,
    criteria2: 0,
    criteria3: 0,
    criteria4: 0,
    criteria5: 0,
    criteria6: 0,
    criteria7: 0,
    criteria8: 0
  });
  const [showGroupSummary, setShowGroupSummary] = useState(false);
  const [showIndividualSummary, setShowIndividualSummary] = useState(false);
  const [groupSummary, setGroupSummary] = useState([]);
  const [individualSummary, setIndividualSummary] = useState([]);
  const [groupTotal, setGroupTotal] = useState(0);
  const [individualTotal, setIndividualTotal] = useState(0);
  const [maxIndividualTotal, setMaxIndividualTotal] = useState(0);
  
  const handleGroupSubmit = (e) => {
    e.preventDefault();

    const project = document.getElementById('group-project').value;
    const groupName = document.getElementById('group-name').value;

    const summary = Object.keys(groupScores).map((key, index) => {
      const criterion = criteriaData[index];
      const score = parseFloat(groupScores[key]);
      const percentage = ((score / criterion.max) * 100).toFixed(1);

      return {
        title: criterion.title,
        score,
        max: criterion.max,
        percentage
      };
    });

    const total = summary.reduce((acc, cur) => acc + cur.score, 0);

    setGroupSummary(summary);
    setGroupTotal(total);
    setShowGroupSummary(true);

    console.log('تم إرسال التقييم الجماعي:', {
      groupName,
      project,
      summary,
      total
    });
  };

  const calculateIndividualTotal = (evaluation) => {
    let total = 0;
    for (const key in evaluation) {
      if (key !== 'group_id' && key !== 'student_id' && key !== 'note' && key !== 'evaluation_type') {
        const value = parseFloat(evaluation[key]);
        if (!isNaN(value)) {
          total += value;
        }
      }
    }
    return total;
  };

  const [selectedEvaluationType, setSelectedEvaluationType] = useState('');

  // Sidebar and user states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    image: '',
    role: ''
  });

  // Sidebar functions
  const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);
  const closeMobileSidebar = () => setMobileSidebarOpen(false);
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const calculateGroupTotal = (scores) => {
    return Object.values(scores).reduce((total, score) => total + parseFloat(score || 0), 0);
  };

  const handleIndividualSubmit = (e, groupId) => {
    e.preventDefault();

    const groupScores = individualEvaluations[groupId];
    const total = calculateGroupTotal(groupScores);

    console.log(`Total score for group ${groupId}:`, total);
  };

  const handleEvaluationTypeChange = (e) => {
    setSelectedEvaluationType(e.target.value);
    setEvaluationType(e.target.value);
  };

  const handleTaskChange = (e) => {
    const taskValue = e.target.value;
    if (e.target.checked) {
      setSelectedTasks([...selectedTasks, taskValue]);
    } else {
      setSelectedTasks(selectedTasks.filter(task => task !== taskValue));
    }
  };

  const handleScoreChange = (type, criteriaId, value) => {
    if (type === 'group') {
      setGroupScores({
        ...groupScores,
        [`criteria${criteriaId}`]: value
      });
    } else {
      setIndividualScores({
        ...individualScores,
        [`criteria${criteriaId}`]: value
      });
    }
  };

  // Function to handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowGroupSummary(false);
    setShowIndividualSummary(false);
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:8000/api/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = response.data;
        setUserInfo({
          name: userData.name,
          image: userData.profile_picture || 'https://randomuser.me/api/portraits/women/44.jpg',
          role: userData.role
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Existing constants
  const criteriaData = [
    { id: 'criteria1', title: 'تعريف حدود المسألة أو النظام المقترح', max: 10 },
    { id: 'criteria2', title: 'الدراسة النظرية', max: 10 },
    { id: 'criteria3', title: 'دراسة المرجعية', max: 10 },
    { id: 'criteria4', title: 'الدراسة التحليلية وملف SRS', max: 15 },
    { id: 'criteria5', title: 'مخططات الصفوف ومخطط ERD', max: 20 },
    { id: 'criteria6', title: 'نسبة ربط Front و Back', max: 10 },
    { id: 'criteria7', title: 'إنجاز المتطلبات الوظيفية', max: 15 },
    { id: 'criteria8', title: 'إدارة المشروع', max: 10 }
  ];

  const taskOptions = [
    { id: 'task1', value: 'تعريف حدود المسألة', label: 'تعريف حدود المسألة' },
    { id: 'task2', value: 'الدراسة النظرية', label: 'الدراسة النظرية' },
    { id: 'task3', value: 'دراسة المرجعية', label: 'دراسة المرجعية' },
    { id: 'task4', value: 'الدراسة التحليلية', label: 'الدراسة التحليلية' },
    { id: 'task5', value: 'مخططات الصفوف', label: 'مخططات الصفوف' },
    { id: 'task6', value: 'ربط Front و Back', label: 'ربط Front و Back' },
    { id: 'task7', value: 'المتطلبات الوظيفية', label: 'المتطلبات الوظيفية' },
    { id: 'task8', value: 'إدارة المشروع', label: 'إدارة المشروع' }
  ];

  const projectOptions = [
    { value: '', label: '-- اختر مشروع --' },
    { value: 'project1', label: 'نظام إدارة المكتبة' },
    { value: 'project2', label: 'تطبيق حجز مواعيد' },
    { value: 'project3', label: 'منصة تعليم إلكتروني' },
    { value: 'project4', label: 'نظام متابعة الصيانة' }
  ];

  return (
    <div className="dashboard-container-dash-sup">
      <Sidebar 
        user={userInfo} 
        collapsed={sidebarCollapsed} 
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={closeMobileSidebar}
      />
      
      <div className="main-container">
        <div className='supervisor-dashboard'>
          <TopNav 
            user={userInfo} 
            onToggleSidebar={toggleSidebar}
            onToggleMobileSidebar={toggleMobileSidebar}
          />

          <div className="evaluation-coordinator-container">
            <div className={`overlay ${mobileSidebarOpen ? 'active' : ''}`} onClick={closeMobileSidebar}></div>
            
            <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
              <div className="page-content">
                <div className="container">
                  <div className="tabs">
                    <button 
                      className={`tab-btn ${activeTab === 'group' ? 'active' : ''}`} 
                      onClick={() => handleTabChange('group')}
                    >
                      تقييم جماعي
                    </button>
                    <button 
                      className={`tab-btn ${activeTab === 'individual' ? 'active' : ''}`} 
                      onClick={() => handleTabChange('individual')}
                    >
                      تقييم فردي
                    </button>
                  </div>
                  
                  <div className={`tab-content ${activeTab === 'group' ? 'active' : ''}`} id="group">
                    <form className="evaluation-form" onSubmit={handleGroupSubmit}>
                      <div className="form-group">
                        <label htmlFor="group-project">اختر المشروع:</label>
                        <select id="group-project" required>
                          {projectOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="group-name">اسم المجموعة:</label>
                        <input type="text" id="group-name" required />
                      </div>
                      
                      {criteriaData.map(criterion => (
                        <div className="criteria-item" key={criterion.id}>
                          <div className="criteria-title">
                            <span>{criterion.title}</span>
                            <span className="criteria-max">({criterion.max} علامة{criterion.max === 10 ? '' : 'ات'})</span>
                          </div>
                          <div className="rating">
                            <input 
                              type="number" 
                              min="0" 
                              max={criterion.max} 
                              step="0.5" 
                              id={`group-${criterion.id}`} 
                              value={groupScores[criterion.id.replace('criteria', '')]}
                              onChange={(e) => handleScoreChange('group', criterion.id.replace('criteria', ''), e.target.value)}
                              required 
                            />
                            <span>/{criterion.max}</span>
                          </div>
                        </div>
                      ))}
                      
                      <div className="actions">
                        <button type="button" className="btn" onClick={() => {
                          const total = calculateGroupTotal(groupScores);
                          setGroupTotal(total);
                        }}>حساب المجموع</button>
                        <button type="submit" className="btn btn-export">حفظ التقييم</button>
                      </div>
                    </form>
                    
                    {showGroupSummary && (
                      <div className="summary" id="group-summary">
                        <div className="summary-title">ملخص التقييم الجماعي</div>
                        <div id="group-summary-content">
                          {groupSummary.map((item, index) => (
                            <div className="summary-item" key={index}>
                              <span>{item.title}</span>
                              <span>{item.score} / {item.max} ({item.percentage}%)</span>
                            </div>
                          ))}
                        </div>
                        <div className="summary-total" id="group-total">المجموع الكلي: {groupTotal} / 100</div>
                      </div>
                    )}
                  </div>
                  
                  <div className={`tab-content ${activeTab === 'individual' ? 'active' : ''}`} id="individual">
                    <form className="evaluation-form" onSubmit={(e) => handleIndividualSubmit(e, 'individual')}>
                      <div className="form-group">
                        <label htmlFor="individual-project">اختر المشروع:</label>
                        <select id="individual-project" required>
                          {projectOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="individual-name">اسم الطالب:</label>
                        <input type="text" id="individual-name" required />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="evaluation-type">نوع التقييم:</label>
                        <select 
                          id="evaluation-type" 
                          value={evaluationType}
                          onChange={handleEvaluationTypeChange}
                          required
                        >
                          <option value="">-- اختر نوع التقييم --</option>
                          <option value="full">تقييم كامل</option>
                          <option value="partial">تقييم جزئي لمهمة محددة</option>
                        </select>
                      </div>
                      
                      {evaluationType === 'partial' && (
                        <div className="student-selector active" id="task-selector">
                          <label>حدد المهمة المطلوبة:</label>
                          <div className="checkbox-group">
                            {taskOptions.map(task => (
                              <div className="checkbox-item" key={task.id}>
                                <input 
                                  type="checkbox" 
                                  id={task.id} 
                                  name="tasks" 
                                  value={task.value}
                                  checked={selectedTasks.includes(task.value)}
                                  onChange={handleTaskChange}
                                />
                                <label htmlFor={task.id}>{task.label}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div id="individual-criteria-container">
                        {(evaluationType === 'full' || (evaluationType === 'partial' && selectedTasks.length > 0)) && (
                          <>
                            {criteriaData
                              .filter(criterion => 
                                evaluationType === 'full' || 
                                selectedTasks.some(task => criterion.title.includes(task))
                              )
                              .map(criterion => (
                                <div className="criteria-item" key={criterion.id}>
                                  <div className="criteria-title">
                                    <span>{criterion.title}</span>
                                    <span className="criteria-max">({criterion.max} علامة{criterion.max === 10 ? '' : 'ات'})</span>
                                  </div>
                                  <div className="rating">
                                    <input 
                                      type="number" 
                                      min="0" 
                                      max={criterion.max} 
                                      step="0.5" 
                                      id={`individual-${criterion.id}`}
                                      value={individualScores[criterion.id.replace('criteria', '')]}
                                      onChange={(e) => handleScoreChange('individual', criterion.id.replace('criteria', ''), e.target.value)}
                                      required 
                                    />
                                    <span>/{criterion.max}</span>
                                  </div>
                                </div>
                              ))
                            }
                          </>
                        )}
                      </div>
                      
                      <div className="actions">
                        <button type="button" className="btn" onClick={() => {
                          const total = calculateIndividualTotal(individualScores);
                          setIndividualTotal(total);
                          setShowIndividualSummary(true);
                        }}>حساب المجموع</button>
                        <button type="submit" className="btn btn-export">حفظ التقييم</button>
                      </div>
                    </form>
                    
                    {showIndividualSummary && (
                      <div className="summary" id="individual-summary">
                        <div className="summary-title">ملخص التقييم الفردي</div>
                        <div id="individual-summary-content">
                          {criteriaData.map((criterion, index) => (
                            individualScores[`criteria${index + 1}`] > 0 && (
                              <div className="summary-item" key={index}>
                                <span>{criterion.title}</span>
                                <span>{individualScores[`criteria${index + 1}`]} / {criterion.max}</span>
                              </div>
                            )
                          ))}
                        </div>
                        <div className="summary-total" id="individual-total">
                          {evaluationType === 'full' ? 'المجموع الكلي' : 'المجموع الجزئي'}: {individualTotal}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationCoordinator;