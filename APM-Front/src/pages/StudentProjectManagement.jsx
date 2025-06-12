import React, { useState, useEffect } from 'react';
import './StudentProjectManagement.css';
import ProjectHeader from '../components/Header/ProjectHeader';
import axios from 'axios';

const StudentProjectManagement = () => {
  // States
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    stages: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLeader, setIsLeader] = useState(false);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showForms, setShowForms] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentSubmissionTask, setCurrentSubmissionTask] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [newTasks, setNewTasks] = useState({});
  const [groupStudents, setGroupStudents] = useState([]);
  const [githubRepo, setGithubRepo] = useState('');
  const [githubCommitUrl, setGithubCommitUrl] = useState('');
  const [commitDescription, setCommitDescription] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const groupId = localStorage.getItem('selectedGroupId');
        
        if (!groupId) throw new Error('Group ID not found');

        // Fetch current user
        const userRes = await axios.get('http://127.0.0.1:8000/api/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCurrentUser(userRes.data);

        // Check if supervisor first (since supervisors don't need leader check)
        try {
          const supervisorRes = await axios.get(
            `http://127.0.0.1:8000/api/groups/${groupId}/is-supervisor`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setIsSupervisor(supervisorRes.data.is_supervisor);
        } catch (supervisorError) {
          setIsSupervisor(false);
        }

        // Only check for leader if not a supervisor
        if (!isSupervisor) {
          try {
            const leaderRes = await axios.get(
              `http://127.0.0.1:8000/api/groups/${groupId}/is-leader`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setIsLeader(leaderRes.data.is_leader);
          } catch (leaderError) {
            setIsLeader(false);
          }
        }

        // Fetch group students
        const studentsRes = await axios.get(
          `http://127.0.0.1:8000/api/groups/${groupId}/students`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setGroupStudents(studentsRes.data.data || []);

        // Fetch stages
        const stagesRes = await axios.get(
          `http://127.0.0.1:8000/api/group-stages/${groupId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (stagesRes.data?.data) {
          const stagesWithTasks = await Promise.all(
            stagesRes.data.data.map(async (stage) => {
              const tasksRes = await axios.get(
                `http://127.0.0.1:8000/api/stages/${stage.id}/tasks`,
                { headers: { 'Authorization': `Bearer ${token}` } }
              );

              return {
                id: stage.id,
                name: stage.title,
                deadline: stage.due_date,
                description: stage.description,
                tasks: tasksRes.data.map(task => ({
                  id: task.id,
                  title: task.title,
                  description: task.description,
                  responsible: task.assignee?.user?.name || 'غير محدد',
                  responsibleId: task.assigned_to,
                  deadline: task.due_date,
                  status: task.status,
                  priority: task.priority,
                  attachments: []
                }))
              };
            })
          );

          setProjectData(prev => ({ ...prev, stages: stagesWithTasks }));
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isSupervisor]);

  // Helper functions
  const isTaskAssignedToCurrentUser = (task) => {
    return currentUser?.student?.studentId === task.responsibleId;
  };

  const toggleForm = (stageId) => {
    setShowForms(prev => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  const handleSubmissionFileChange = (e) => {
    setSubmissionFiles(Array.from(e.target.files));
  };

  const handleNewTaskFileChange = (stageId, e) => {
    setNewTasks(prev => ({
      ...prev,
      [stageId]: { ...prev[stageId], files: Array.from(e.target.files) }
    }));
  };

  const handleNewTaskChange = (stageId, field, value) => {
    setNewTasks(prev => ({
      ...prev,
      [stageId]: { ...prev[stageId], [field]: value }
    }));
  };

  const addNewTask = async (stageId) => {
    try {
      const token = localStorage.getItem('access_token');
      const newTaskData = newTasks[stageId];

      if (!newTaskData?.title || !newTaskData?.responsibleId) {
        return alert('الرجاء إدخال عنوان المهمة واختيار المسؤول');
      }

      const taskPayload = {
        project_stage_id: stageId,
        title: newTaskData.title,
        description: newTaskData.description || '',
        assigned_to: parseInt(newTaskData.responsibleId),
        due_date: newTaskData.deadline,
        priority: newTaskData.priority || 'medium'
      };

      const res = await axios.post(
        'http://127.0.0.1:8000/api/tasks',
        taskPayload,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (res.data) {
        // Find the selected student
        const selectedStudent = groupStudents.find(s => s.studentId === parseInt(newTaskData.responsibleId));

        setProjectData(prev => ({
          ...prev,
          stages: prev.stages.map(s => s.id === stageId ? {
            ...s,
            tasks: [...s.tasks, {
              id: res.data.id,
              title: res.data.title,
              description: res.data.description,
              responsible: selectedStudent?.user?.name || 'غير محدد',
              responsibleId: res.data.assigned_to,
              deadline: res.data.due_date,
              status: res.data.status,
              priority: res.data.priority,
              attachments: []
            }]
          } : s)
        }));

        setNewTasks(prev => ({ ...prev, [stageId]: {} }));
        setShowForms(prev => ({ ...prev, [stageId]: false }));
        alert('تم إضافة المهمة بنجاح');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ أثناء إضافة المهمة: ' + (error.response?.data?.message || error.message));
    }
  };

  const submitTaskToAPI = async () => {
    try {
      if (!currentSubmissionTask) return;

      const token = localStorage.getItem('access_token');
      const formData = new FormData();

      // Add required fields
      formData.append('content', submissionNotes);
      formData.append('github_repo', githubRepo);
      formData.append('github_commit_url', githubCommitUrl);
      formData.append('commit_description', commitDescription);

      // Add files if any
      submissionFiles.forEach(file => {
        formData.append('attachment', file);
      });

      const response = await axios.post(
        `http://127.0.0.1:8000/api/tasks/${currentSubmissionTask}/submit`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        // Update local state
        const updatedStages = projectData.stages.map(stage => ({
          ...stage,
          tasks: stage.tasks.map(task => task.id === currentSubmissionTask ? {
            ...task,
            status: 'completed',
            attachments: [
              ...task.attachments,
              ...submissionFiles.map(file => ({
                name: file.name,
                url: URL.createObjectURL(file),
                type: file.type.startsWith('image/') ? 'image' : 'file'
              }))
            ]
          } : task)
        }));

        setProjectData(prev => ({ ...prev, stages: updatedStages }));
        
        // Reset modal
        setShowModal(false);
        setCurrentSubmissionTask(null);
        setSubmissionNotes('');
        setSubmissionFiles([]);
        setGithubRepo('');
        setGithubCommitUrl('');
        setCommitDescription('');
        
        alert('تم تسليم المهمة بنجاح');
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      alert('حدث خطأ أثناء تسليم المهمة: ' + (error.response?.data?.message || error.message));
    }
  };

  const renderAttachments = (attachments) => {
    if (!attachments?.length) {
      return (
        <div className="task-attachments">
          <div className="attachment-label">المرفقات:</div>
          <div style={{ color: '#888', fontSize: '0.9rem' }}>لا توجد مرفقات</div>
        </div>
      );
    }
    
    return (
      <div className="task-attachments">
        <div className="attachment-label">المرفقات:</div>
        <div className="attachment-container">
          {attachments.map((attachment, index) => (
            <div key={index} className="attachment-item">
              <a href={attachment.url} className="attachment-link" target="_blank" rel="noopener noreferrer">
                <span className="attachment-icon">
                  {attachment.type === 'image' ? '🖼️' : '📄'}
                </span>
                {attachment.name}
              </a>
              {attachment.type === 'image' && (
                <span onClick={(e) => showImagePreview(e, attachment.url)} style={{ cursor: 'pointer' }}>👁️</span>
              )}
            </div>
          ))}
        </div>
        {attachments.filter(a => a.type === 'image').map((_, index) => (
          <img key={index} className="attachment-preview" alt="معاينة المرفق" />
        ))}
      </div>
    );
  };

  const showImagePreview = (e, imageUrl) => {
    const previewImg = e.target.closest('.attachment-item').nextElementSibling;
    if (previewImg?.classList.contains('attachment-preview')) {
      previewImg.style.display = previewImg.style.display === 'block' ? 'none' : 'block';
      previewImg.src = previewImg.style.display === 'block' ? imageUrl : '';
    }
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('ar-EG') : 'غير محدد';

  const renderPriorityBadge = (priority) => {
    const classes = {
      high: 'high-spm',
      medium: 'medium-spm',
      low: 'low-spm'
    };
    return <span className={`priority-badge ${classes[priority]}`}>{
      priority === 'high' ? 'عالي' : 
      priority === 'medium' ? 'متوسط' : 
      priority === 'low' ? 'منخفض' : 'غير محدد'
    }</span>;
  };

  const renderStatusBadge = (status) => {
    const classes = {
      completed: 'completed',
      in_progress: 'in-progress',
      pending: 'pending'
    };
    return <span className={`status-badge ${classes[status]}`}>{
      status === 'completed' ? 'مكتمل' : 
      status === 'in_progress' ? 'قيد التنفيذ' : 
      status === 'pending' ? 'قيد الانتظار' : 'غير محدد'
    }</span>;
  };

  const renderTaskActions = (task) => {
    return (
      <>
        <button 
          className="action-btn-management" 
          onClick={() => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.zip,.rar,.txt';
            fileInput.multiple = true;
            fileInput.onchange = (e) => {
              const files = Array.from(e.target.files);
              if (files.length === 0) return;
              
              setProjectData(prev => ({
                ...prev,
                stages: prev.stages.map(s => ({
                  ...s,
                  tasks: s.tasks.map(t => t.id === task.id ? {
                    ...t,
                    attachments: [
                      ...t.attachments,
                      ...files.map(file => ({
                        type: file.type.startsWith('image/') ? 'image' : 'file',
                        name: file.name,
                        url: URL.createObjectURL(file)
                      }))
                    ]
                  } : t)
                }))
              }));
              alert(`تم إضافة ${files.length} مرفق جديد`);
            };
            fileInput.click();
          }}
        >
          <span className="action-icon">📎</span>
          <span>إضافة مرفق</span>
        </button>

        {!isSupervisor && isTaskAssignedToCurrentUser(task) && task.status !== 'completed' && (
          <button 
            className="action-btn-management primary supmit-spm" 
            onClick={() => {
              setCurrentSubmissionTask(task.id);
              setShowModal(true);
            }}
          >
            <span className="action-icon">✅</span>
            <span>إعلام بالإنجاز</span>
          </button>
        )}
      </>
    );
  };

  if (loading) return (
    <div className="container-tasks">
      <ProjectHeader title="إدارة المشروع" description="جاري تحميل البيانات..." />
      <div className="loading-spinner">جاري تحميل بيانات المشروع...</div>
    </div>
  );

  if (error) return (
    <div className="container-tasks">
      <ProjectHeader title="إدارة المشروع" description="حدث خطأ أثناء تحميل البيانات" />
      <div className="error-message">{error}</div>
    </div>
  );

  return (
    <div className="container-tasks">
      <ProjectHeader 
        title="إدارة المشروع"
        description={projectData.description || "لا يوجد وصف للمشروع"}
        teamMembers={groupStudents.length}
        startDate="01/01/2023"
        endDate="15/06/2023"
      />
      
      <div className="stages-container">
        {projectData.stages.length === 0 ? (
          <div className="no-stages-message">لا توجد مراحل متاحة لهذا المشروع حتى الآن</div>
        ) : (
          projectData.stages.map(stage => (
            <div key={stage.id} className="stage">
              <div className="stage-header">
                {stage.name}
                <div className="stage-deadline">موعد التسليم: {formatDate(stage.deadline)}</div>
              </div>
            
              <div className="tasks-container">
                {stage.tasks.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#888', padding: '30px 20px' }}>
                    لا توجد مهام حتى الآن
                  </div>
                ) : (
                  stage.tasks.map(task => (
                    <div key={task.id} className={`task-management ${task.status}`}>
                      <div className="task-header">
                        <div className="task-title-management">{task.title}</div>
                        <div className="task-meta">
                          {renderPriorityBadge(task.priority)}
                          {renderStatusBadge(task.status)}
                        </div>
                      </div>
                      {task.description && <div className="task-description-management">{task.description}</div>}
                      <div className="task-meta">
                        <div className="task-responsible">المسؤول: {task.responsible}</div>
                        <div className="task-deadline">الموعد النهائي: {formatDate(task.deadline)}</div>
                      </div>
                      {renderAttachments(task.attachments)}
                      <div className="task-actions">
                        {renderTaskActions(task)}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {(isLeader || isSupervisor) && (
                <button 
                  className="toggle-form-btn" 
                  onClick={() => toggleForm(stage.id)}
                >
                  {showForms[stage.id] ? 'إخفاء النموذج' : 'إضافة مهمة جديدة'}
                </button>
              )}

              {(isLeader || isSupervisor) && showForms[stage.id] && (
                <div className="add-task-form">
                  <div className="form-group-tasks">
                    <label htmlFor={`task-title-${stage.id}`}>عنوان المهمة:</label>
                    <input 
                      type="text" 
                      id={`task-title-${stage.id}`}
                      placeholder="أدخل عنوان المهمة"
                      value={newTasks[stage.id]?.title || ''}
                      onChange={(e) => handleNewTaskChange(stage.id, 'title', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group-tasks">
                    <label htmlFor={`task-desc-${stage.id}`}>وصف المهمة (اختياري):</label>
                    <textarea 
                      id={`task-desc-${stage.id}`}
                      placeholder="أدخل وصف المهمة"
                      value={newTasks[stage.id]?.description || ''}
                      onChange={(e) => handleNewTaskChange(stage.id, 'description', e.target.value)}
                    />
                  </div>
                  <div className="form-row-tasks">
                    <div className="form-group-tasks">
                      <label htmlFor={`task-resp-${stage.id}`}>المسؤول:</label>
                      <select
                        id={`task-resp-${stage.id}`}
                        value={newTasks[stage.id]?.responsibleId || ''}
                        onChange={(e) => handleNewTaskChange(stage.id, 'responsibleId', e.target.value)}
                        className="student-select"
                        required
                      >
                        <option value="">اختر طالب من المجموعة</option>
                        {groupStudents.map(student => (
                          <option key={student.studentId} value={student.studentId}>
                            {student.user?.name || student.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group-tasks">
                      <label htmlFor={`task-due-${stage.id}`}>موعد التسليم:</label>
                      <input 
                        type="date" 
                        id={`task-due-${stage.id}`}
                        value={newTasks[stage.id]?.deadline || ''}
                        onChange={(e) => handleNewTaskChange(stage.id, 'deadline', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group-tasks">
                    <label htmlFor={`task-priority-${stage.id}`}>الأولوية:</label>
                    <select 
                      id={`task-priority-${stage.id}`}
                      value={newTasks[stage.id]?.priority || 'medium'}
                      onChange={(e) => handleNewTaskChange(stage.id, 'priority', e.target.value)}
                      required
                    >
                      <option value="high">عالي</option>
                      <option value="medium">متوسط</option>
                      <option value="low">منخفض</option>
                    </select>
                  </div>
                  <div 
                    className="file-upload-area"
                    id={`file-upload-area-${stage.id}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDragLeave={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleNewTaskFileChange(stage.id, { target: { files: e.dataTransfer.files } });
                      e.currentTarget.querySelector('.file-upload-text').textContent = 
                        `تم اختيار: ${Array.from(e.dataTransfer.files).map(f => f.name).join(', ')}`;
                    }}
                  >
                    <div className="file-upload-text">
                      {newTasks[stage.id]?.files?.length > 0 ? 
                        `تم اختيار: ${newTasks[stage.id].files.map(f => f.name).join(', ')}` : 
                        'قم بسحب وإسقاط الملفات هنا أو'}
                    </div>
                    <button 
                      type="button"
                      onClick={() => document.getElementById(`file-input-${stage.id}`).click()}
                    >
                      اختر ملفات
                    </button>
                    <input 
                      type="file" 
                      id={`file-input-${stage.id}`}
                      className="file-input"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip,.rar"
                      multiple
                      onChange={(e) => {
                        handleNewTaskFileChange(stage.id, e);
                        document.querySelector(`#file-upload-area-${stage.id} .file-upload-text`).textContent = 
                          `تم اختيار: ${Array.from(e.target.files).map(f => f.name).join(', ')}`;
                      }}
                    />
                  </div>
                  <button 
                    type="button"
                    className="add-task-btn" 
                    onClick={() => addNewTask(stage.id)}
                  >
                    إضافة المهمة
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className={`modal-overlay-tasks ${showModal ? 'show' : ''}`}>
        <div className="modal-content-tasks">
          <div className="modal-header-spm">إعلام بإكمال المهمة</div>
          <div className="modal-body">
            <div className="form-group-tasks">
              <label htmlFor="submissionNotes">ملاحظات حول الإنجاز:</label>
              <textarea 
                id="submissionNotes"
                placeholder="أدخل ملاحظاتك عن إنجاز المهمة (اختياري)"
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
              />
            </div>

            <div className="form-group-tasks">
              <label htmlFor="githubRepo">مستودع GitHub:</label>
              <input 
                type="text" 
                id="githubRepo"
                placeholder="اسم المستودع (مثال: username/repo-name)"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                required
              />
            </div>

            <div className="form-group-tasks">
              <label htmlFor="githubCommitUrl">رابط Commit:</label>
              <input 
                type="url" 
                id="githubCommitUrl"
                placeholder="https://github.com/username/repo/commit/abc123"
                value={githubCommitUrl}
                onChange={(e) => setGithubCommitUrl(e.target.value)}
                required
              />
            </div>

            <div className="form-group-tasks">
              <label htmlFor="commitDescription">وصف التغييرات:</label>
              <textarea 
                id="commitDescription"
                placeholder="أدخل وصفاً للتغييرات التي قمت بها"
                value={commitDescription}
                onChange={(e) => setCommitDescription(e.target.value)}
                required
              />
            </div>

            <div 
              className="file-upload-area"
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setSubmissionFiles(Array.from(e.dataTransfer.files));
              }}
            >
              <div className="file-upload-text">
                {submissionFiles.length > 0 ? 
                  `تم اختيار: ${submissionFiles.map(f => f.name).join(', ')}` : 
                  'يمكنك إرفاق ملفات إضافية للإنجاز (اختياري)'}
              </div>
              <button 
                type="button"
                onClick={() => document.getElementById('submissionFiles').click()}
              >
                اختر ملفات
              </button>
              <input 
                type="file" 
                id="submissionFiles"
                className="file-input"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip,.rar"
                multiple
                onChange={handleSubmissionFileChange}
              />
            </div>
            <div className="file-preview">
              {submissionFiles.map((file, index) => (
                <div key={index} className="file-preview-item">
                  <i className="fas fa-file"></i> {file.name}
                </div>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button"
              className="modal-btn secondary" 
              onClick={() => {
                setShowModal(false);
                setCurrentSubmissionTask(null);
                setSubmissionNotes('');
                setSubmissionFiles([]);
                setGithubRepo('');
                setGithubCommitUrl('');
                setCommitDescription('');
              }}
            >
              إلغاء
            </button>
            <button 
              type="button"
              className="modal-btn primary" 
              onClick={submitTaskToAPI}
              disabled={!githubRepo || !githubCommitUrl || !commitDescription}
            >
              تأكيد الإنجاز
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProjectManagement;