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
  // States
  const [activeTab, setActiveTab] = useState('group');
  const [evaluationType, setEvaluationType] = useState('');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [groupScores, setGroupScores] = useState({
    problem_definition: 0,
    theoretical_study: 0,
    reference_study: 0,
    analytical_study: 0,
    class_diagram: 0,
    erd_diagram: 0,
    front_back_connection: 0,
    requirements_achievement: 0,
    final_presentation: 0
  });
  const [individualScores, setIndividualScores] = useState({
    problem_definition: 0,
    theoretical_study: 0,
    reference_study: 0,
    analytical_study: 0,
    class_diagram: 0,
    erd_diagram: 0,
    front_back_connection: 0,
    requirements_achievement: 0,
    final_presentation: 0
  });
  const [showGroupSummary, setShowGroupSummary] = useState(false);
  const [showIndividualSummary, setShowIndividualSummary] = useState(false);
  const [groupSummary, setGroupSummary] = useState([]);
  const [individualSummary, setIndividualSummary] = useState([]);
  const [groupTotal, setGroupTotal] = useState(0);
  const [individualTotal, setIndividualTotal] = useState(0);
  const [projects, setProjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState('');
  const [finalGrades, setFinalGrades] = useState(null);
  const [notes, setNotes] = useState('');
  const [isFinal, setIsFinal] = useState(false);
  const [currentStage, setCurrentStage] = useState('');

  // Criteria data based on stage
  const stageCriteria = {
    'مرحلية': [
      { id: 'problem_definition', title: 'تعريف حدود المسألة', max: 10 },
      { id: 'theoretical_study', title: 'الدراسة النظرية', max: 10 },
      { id: 'reference_study', title: 'دراسة المرجعية', max: 10 }
    ],
    'تحليلية': [
      { id: 'analytical_study', title: 'الدراسة التحليلية', max: 15 },
      { id: 'class_diagram', title: 'مخططات الصفوف', max: 10 },
      { id: 'erd_diagram', title: 'مخطط ERD', max: 15 }
    ],
    'نهائية': [
      { id: 'front_back_connection', title: 'ربط Front و Back', max: 100, isPercentage: true },
      { id: 'requirements_achievement', title: 'إنجاز المتطلبات', max: 100, isPercentage: true },
      { id: 'final_presentation', title: 'العرض النهائي', max: 5 }
    ]
  };

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('access_token');
      const selectedDisc = discussions.find(d => d.scheduledId.toString() === selectedDiscussion);
      
      const evaluationData = {
        schedule_id: selectedDiscussion,
        type: 'group',
        stage: selectedDisc.type,
        criteria: groupScores,
        notes: notes,
        is_final: isFinal
      };

      const response = await axios.post(
        'http://127.0.0.1:8000/api/project-evaluations',
        evaluationData,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert('تم حفظ التقييم الجماعي بنجاح');
        setShowGroupSummary(true);
        
        // Calculate summary for display
        const criteriaData = stageCriteria[selectedDisc.type];
        const summary = criteriaData.map(criterion => {
          const score = parseFloat(groupScores[criterion.id]);
          const percentage = criterion.isPercentage ? 
            score : 
            ((score / criterion.max) * 100).toFixed(1);

          return {
            title: criterion.title,
            score,
            max: criterion.max,
            percentage,
            isPercentage: criterion.isPercentage
          };
        });

        setGroupSummary(summary);
        setGroupTotal(response.data.score_details.total);
      }
    } catch (error) {
      console.error('Error submitting group evaluation:', error);
      alert('حدث خطأ أثناء حفظ التقييم الجماعي');
    }
  };

  const handleIndividualSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('access_token');
      const selectedDisc = discussions.find(d => d.scheduledId.toString() === selectedDiscussion);
      
      const evaluationData = {
        schedule_id: selectedDiscussion,
        type: 'individual',
        student_id: selectedStudent,
        stage: selectedDisc.type,
        criteria: individualScores,
        notes: notes,
        is_final: isFinal
      };

      const response = await axios.post(
        'http://127.0.0.1:8000/api/project-evaluations',
        evaluationData,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert('تم حفظ التقييم الفردي بنجاح');
        setShowIndividualSummary(true);
        
        // Calculate summary for display
        const criteriaData = stageCriteria[selectedDisc.type];
        const summary = criteriaData.map(criterion => {
          const score = parseFloat(individualScores[criterion.id]);
          const percentage = criterion.isPercentage ? 
            score : 
            ((score / criterion.max) * 100).toFixed(1);

          return {
            title: criterion.title,
            score,
            max: criterion.max,
            percentage,
            isPercentage: criterion.isPercentage
          };
        });

        setIndividualSummary(summary);
        setIndividualTotal(response.data.score_details.total);
      }
    } catch (error) {
      console.error('Error submitting individual evaluation:', error);
      alert('حدث خطأ أثناء حفظ التقييم الفردي');
    }
  };

  const fetchFinalGrades = async () => {
    if (!selectedGroup) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `http://127.0.0.1:8000/api/project-evaluations/groups/${selectedGroup}/final-grades`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setFinalGrades(response.data);
      }
    } catch (error) {
      console.error('Error fetching final grades:', error);
    }
  };

  // Fetch discussions for selected group
  useEffect(() => {
    const fetchDiscussions = async () => {
      if (!selectedGroup) return;
      
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          `http://127.0.0.1:8000/api/schedules/group/${selectedGroup}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        if (response.data.success) {
          setDiscussions(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching discussions:', error);
        setDiscussions([]);
      }
    };

    fetchDiscussions();
  }, [selectedGroup]);

  // Fetch students for selected group
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedGroup) return;
      
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          `http://127.0.0.1:8000/api/groups/${selectedGroup}/students`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        if (response.data.success) {
          setStudents(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        setStudents([]);
      }
    };

    fetchStudents();
  }, [selectedGroup]);

  // Fetch user data and projects
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

    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          'http://127.0.0.1:8000/api/projects/current-semester-with-progress',
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        const projectsData = response.data.data.projects;
        setProjects(projectsData);
        
        // Extract groups from projects
        const groupsData = projectsData.map(project => ({
          id: project.group.id,
          name: project.group.name,
          projectId: project.project_id
        }));
        setGroups(groupsData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchUserData();
    fetchProjects();
  }, []);

  // Handle project selection change
  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);
    
    // Find the corresponding group for the selected project
    const selectedProjectData = projects.find(p => p.project_id.toString() === projectId);
    if (selectedProjectData) {
      setSelectedGroup(selectedProjectData.group.id.toString());
    }
  };

  // Handle discussion selection change
  const handleDiscussionChange = (e, isGroupTab) => {
    const discussionId = e.target.value;
    setSelectedDiscussion(discussionId);
    
    // Find the selected discussion and set current stage
    const selectedDisc = discussions.find(d => d.scheduledId.toString() === discussionId);
    if (selectedDisc) {
      setCurrentStage(selectedDisc.type);
      
      // Reset scores when discussion changes
      if (isGroupTab) {
        setGroupScores({
          problem_definition: 0,
          theoretical_study: 0,
          reference_study: 0,
          analytical_study: 0,
          class_diagram: 0,
          erd_diagram: 0,
          front_back_connection: 0,
          requirements_achievement: 0,
          final_presentation: 0
        });
      } else {
        setIndividualScores({
          problem_definition: 0,
          theoretical_study: 0,
          reference_study: 0,
          analytical_study: 0,
          class_diagram: 0,
          erd_diagram: 0,
          front_back_connection: 0,
          requirements_achievement: 0,
          final_presentation: 0
        });
      }
    }
  };

  // Function to handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowGroupSummary(false);
    setShowIndividualSummary(false);
  };

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

  const handleScoreChange = (type, criteriaId, value) => {
    const numValue = parseFloat(value) || 0;
    
    if (type === 'group') {
      setGroupScores({
        ...groupScores,
        [criteriaId]: numValue
      });
    } else {
      setIndividualScores({
        ...individualScores,
        [criteriaId]: numValue
      });
    }
  };

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
                    <button 
                      className={`tab-btn ${activeTab === 'grades' ? 'active' : ''}`} 
                      onClick={() => {
                        handleTabChange('grades');
                        fetchFinalGrades();
                      }}
                    >
                      العلامات النهائية
                    </button>
                  </div>
                  
                  <div className={`tab-content ${activeTab === 'group' ? 'active' : ''}`} id="group">
                    <form className="evaluation-form" onSubmit={handleGroupSubmit}>
                      <div className="form-group">
                        <label htmlFor="group-project">اختر المشروع:</label>
                        <select 
                          id="group-project" 
                          required
                          value={selectedProject}
                          onChange={handleProjectChange}
                        >
                          <option value="">-- اختر مشروع --</option>
                          {projects.map(project => (
                            <option key={project.project_id} value={project.project_id}>
                              {project.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="group-discussion">اختر المناقشة:</label>
                        <select 
                          id="group-discussion" 
                          required
                          value={selectedDiscussion}
                          onChange={(e) => handleDiscussionChange(e, true)}
                        >
                          <option value="">-- اختر مناقشة --</option>
                          {discussions.map(discussion => (
                            <option key={discussion.scheduledId} value={discussion.scheduledId}>
                              {discussion.type} - {discussion.date} - {discussion.location}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {currentStage && stageCriteria[currentStage]?.map(criterion => (
                        <div className="criteria-item" key={criterion.id}>
                          <div className="criteria-title">
                            <span>{criterion.title}</span>
                            <span className="criteria-max">
                              ({criterion.isPercentage ? 'نسبة مئوية' : `${criterion.max} علامة`})
                            </span>
                          </div>
                          <div className="rating">
                            <input 
                              type="number" 
                              min="0" 
                              max={criterion.isPercentage ? 100 : criterion.max} 
                              step={criterion.isPercentage ? 1 : 0.5}
                              id={`group-${criterion.id}`} 
                              value={groupScores[criterion.id]}
                              onChange={(e) => handleScoreChange('group', criterion.id, e.target.value)}
                              required 
                            />
                            {!criterion.isPercentage && <span>/{criterion.max}</span>}
                            {criterion.isPercentage && <span>%</span>}
                          </div>
                        </div>
                      ))}
                      
                      <div className="form-group">
                        <label htmlFor="group-notes">ملاحظات:</label>
                        <textarea 
                          id="group-notes" 
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                      
                      <div className="form-group checkbox">
                        <input 
                          type="checkbox" 
                          id="group-final" 
                          checked={isFinal}
                          onChange={(e) => setIsFinal(e.target.checked)}
                        />
                        <label htmlFor="group-final">تقييم نهائي</label>
                      </div>
                      
                      <div className="actions">
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
                              <span>
                                {item.isPercentage ? `${item.score}%` : `${item.score} / ${item.max}`}
                                {!item.isPercentage && ` (${item.percentage}%)`}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="summary-total" id="group-total">
                          المجموع الكلي: {groupTotal}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className={`tab-content ${activeTab === 'individual' ? 'active' : ''}`} id="individual">
                    <form className="evaluation-form" onSubmit={handleIndividualSubmit}>
                      <div className="form-group">
                        <label htmlFor="individual-project">اختر المشروع:</label>
                        <select 
                          id="individual-project" 
                          required
                          value={selectedProject}
                          onChange={handleProjectChange}
                        >
                          <option value="">-- اختر مشروع --</option>
                          {projects.map(project => (
                            <option key={project.project_id} value={project.project_id}>
                              {project.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="group-discussion-individual">اختر المناقشة:</label>
                        <select 
                          id="group-discussion-individual" 
                          required
                          value={selectedDiscussion}
                          onChange={(e) => handleDiscussionChange(e, false)}
                        >
                          <option value="">-- اختر مناقشة --</option>
                          {discussions.map(discussion => (
                            <option key={discussion.scheduledId} value={discussion.scheduledId}>
                              {discussion.type} - {discussion.date} - {discussion.location}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="individual-name">اسم الطالب:</label>
                        <select
                          id="individual-name"
                          required
                          value={selectedStudent}
                          onChange={(e) => setSelectedStudent(e.target.value)}
                        >
                          <option value="">-- اختر طالب --</option>
                          {students.map(student => (
                            <option key={student.studentId} value={student.studentId}>
                              {student.name} {student.is_leader && '(قائد المجموعة)'}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {currentStage && stageCriteria[currentStage]?.map(criterion => (
                        <div className="criteria-item" key={criterion.id}>
                          <div className="criteria-title">
                            <span>{criterion.title}</span>
                            <span className="criteria-max">
                              ({criterion.isPercentage ? 'نسبة مئوية' : `${criterion.max} علامة`})
                            </span>
                          </div>
                          <div className="rating">
                            <input 
                              type="number" 
                              min="0" 
                              max={criterion.isPercentage ? 100 : criterion.max} 
                              step={criterion.isPercentage ? 1 : 0.5}
                              id={`individual-${criterion.id}`}
                              value={individualScores[criterion.id]}
                              onChange={(e) => handleScoreChange('individual', criterion.id, e.target.value)}
                              required 
                            />
                            {!criterion.isPercentage && <span>/{criterion.max}</span>}
                            {criterion.isPercentage && <span>%</span>}
                          </div>
                        </div>
                      ))}
                      
                      <div className="form-group">
                        <label htmlFor="individual-notes">ملاحظات:</label>
                        <textarea 
                          id="individual-notes" 
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                      
                      <div className="form-group checkbox">
                        <input 
                          type="checkbox" 
                          id="individual-final" 
                          checked={isFinal}
                          onChange={(e) => setIsFinal(e.target.checked)}
                        />
                        <label htmlFor="individual-final">تقييم نهائي</label>
                      </div>
                      
                      <div className="actions">
                        <button type="submit" className="btn btn-export">حفظ التقييم</button>
                      </div>
                    </form>
                    
                    {showIndividualSummary && (
                      <div className="summary" id="individual-summary">
                        <div className="summary-title">ملخص التقييم الفردي</div>
                        <div id="individual-summary-content">
                          {individualSummary.map((item, index) => (
                            <div className="summary-item" key={index}>
                              <span>{item.title}</span>
                              <span>
                                {item.isPercentage ? `${item.score}%` : `${item.score} / ${item.max}`}
                                {!item.isPercentage && ` (${item.percentage}%)`}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="summary-total" id="individual-total">
                          المجموع الكلي: {individualTotal}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className={`tab-content ${activeTab === 'grades' ? 'active' : ''}`} id="grades">
                    {finalGrades ? (
                      <div className="grades-container">
                        <div className="group-grades">
                          <h3>العلامات الجماعية: {finalGrades.group.name}</h3>
                          <div className="grades-table">
                            <table>
                              <thead>
                                <tr>
                                  <th>المرحلة</th>
                                  <th>العلامة</th>
                                  <th>النسبة</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(finalGrades.group.grades).map(([stage, grade]) => (
                                  <tr key={stage}>
                                    <td>{stage}</td>
                                    <td>{grade}</td>
                                    <td>{((grade / 30) * 100).toFixed(1)}%</td>
                                  </tr>
                                ))}
                                <tr className="total-row">
                                  <td>المجموع</td>
                                  <td>{finalGrades.group.total_grade}</td>
                                  <td>{finalGrades.group.overall_score_details.percentage}%</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        
                        <div className="individual-grades">
                          <h3>العلامات الفردية</h3>
                          <div className="grades-table">
                            <table>
                              <thead>
                                <tr>
                                  <th>الطالب</th>
                                  {Object.keys(finalGrades.group.grades).map(stage => (
                                    <th key={stage}>{stage}</th>
                                  ))}
                                  <th>المجموع</th>
                                  <th>النسبة</th>
                                </tr>
                              </thead>
                              <tbody>
                                {finalGrades.individual_grades.map(student => (
                                  <tr key={student.student_id}>
                                    <td>{student.name}</td>
                                    {Object.values(student.grades).map((grade, idx) => (
                                      <td key={idx}>{grade}</td>
                                    ))}
                                    <td>{student.total_grade}</td>
                                    <td>{student.percentage}%</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="no-grades">
                        <p>لا توجد علامات متاحة لهذه المجموعة</p>
                        <button onClick={fetchFinalGrades} className="btn">
                          تحديث العلامات
                        </button>
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