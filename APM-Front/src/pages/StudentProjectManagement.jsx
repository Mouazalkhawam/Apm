import React, { useState, useEffect } from 'react';
import './StudentProjectManagement.css';
import ProjectHeader from '../components/Header/ProjectHeader';
import axios from 'axios';

const StudentProjectManagement = () => {
  // Project data state
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    stages: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLeader, setIsLeader] = useState(false);

  // States for UI
  const [showForms, setShowForms] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentSubmissionTask, setCurrentSubmissionTask] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [newTasks, setNewTasks] = useState({});

  // Fetch project data and check leader status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupId = localStorage.getItem('selectedGroupId');
        if (!groupId) {
          throw new Error('Group ID not found in local storage');
        }

        const token = localStorage.getItem('access_token');
        
        // Check if user is leader
        const leaderResponse = await axios.get(
          `http://127.0.0.1:8000/api/groups/${groupId}/is-leader`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        setIsLeader(leaderResponse.data.is_leader);

        // Fetch project stages
        const stagesResponse = await axios.get(
          `http://127.0.0.1:8000/api/group-stages/${groupId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (stagesResponse.data && stagesResponse.data.data) {
          const stages = stagesResponse.data.data.map(stage => ({
            id: stage.id,
            name: stage.title,
            deadline: stage.due_date,
            description: stage.description,
            tasks: []
          }));

          setProjectData(prev => ({
            ...prev,
            stages: stages
          }));
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Initialize showForms state
    const initialShowForms = {};
    projectData.stages.forEach(stage => {
      initialShowForms[stage.id] = false;
    });
    setShowForms(initialShowForms);
  }, []);

  // Toggle add task form visibility
  const toggleForm = (stageId) => {
    setShowForms(prev => ({
      ...prev,
      [stageId]: !prev[stageId]
    }));
  };

  // Handle file input change for submission
  const handleSubmissionFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSubmissionFiles(files);
  };

  // Handle file input change for new task
  const handleNewTaskFileChange = (stageId, e) => {
    const files = Array.from(e.target.files);
    setNewTasks(prev => ({
      ...prev,
      [stageId]: {
        ...prev[stageId],
        files: files
      }
    }));
  };

  // Handle new task input change
  const handleNewTaskChange = (stageId, field, value) => {
    setNewTasks(prev => ({
      ...prev,
      [stageId]: {
        ...prev[stageId],
        [field]: value
      }
    }));
  };

  // Add new task to a stage
  const addNewTask = (stageId) => {
    const stage = projectData.stages.find(s => s.id === stageId);
    const newTaskData = newTasks[stageId];

    if (!newTaskData || !newTaskData.title || !newTaskData.responsible) {
      alert('الرجاء إدخال عنوان المهمة واسم المسؤول');
      return;
    }

    const newTaskId = stage.tasks.length > 0 ? 
      Math.max(...stage.tasks.map(t => t.id)) + 1 : 
      stageId * 100 + 1;

    const newTask = {
      id: newTaskId,
      title: newTaskData.title,
      description: newTaskData.description || '',
      responsible: newTaskData.responsible,
      deadline: newTaskData.deadline || null,
      attachments: []
    };

    // Add file attachments if any
    if (newTaskData.files && newTaskData.files.length > 0) {
      newTaskData.files.forEach(file => {
        const isImage = file.type.startsWith('image/');
        const isLink = file.name.startsWith('http') || file.name.startsWith('www');
        
        newTask.attachments.push({
          type: isImage ? 'image' : (isLink ? 'link' : 'file'),
          name: isLink ? 'رابط خارجي' : file.name,
          url: isLink ? file.name : URL.createObjectURL(file)
        });
      });
    }

    // Update project data
    const updatedStages = projectData.stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          tasks: [...s.tasks, newTask]
        };
      }
      return s;
    });

    setProjectData({
      ...projectData,
      stages: updatedStages
    });

    // Reset form
    setNewTasks(prev => ({
      ...prev,
      [stageId]: {}
    }));
    setShowForms(prev => ({
      ...prev,
      [stageId]: false
    }));
  };

  // Submit task completion
  const confirmSubmission = () => {
    if (!currentSubmissionTask) return;

    const taskId = currentSubmissionTask;
    const updatedStages = projectData.stages.map(stage => {
      const updatedTasks = stage.tasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, completed: true };
          if (submissionNotes) {
            updatedTask.submissionNotes = submissionNotes;
          }
          if (submissionFiles.length > 0) {
            updatedTask.submissionFiles = submissionFiles.map(file => ({
              name: file.name,
              url: URL.createObjectURL(file)
            }));
          }
          return updatedTask;
        }
        return task;
      });
      return { ...stage, tasks: updatedTasks };
    });

    setProjectData({
      ...projectData,
      stages: updatedStages
    });

    // Reset modal
    setShowModal(false);
    setCurrentSubmissionTask(null);
    setSubmissionNotes('');
    setSubmissionFiles([]);

    // Show success message
    alert('تم تسليم المهمة بنجاح وإعلام الفريق بإكمالها');
  };

  // Render attachments with preview for images
  const renderAttachments = (attachments) => {
    if (!attachments || attachments.length === 0) {
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
                  {attachment.type === 'image' ? '🖼️' : attachment.type === 'link' ? '🔗' : '📄'}
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

  // Show image preview when clicking on the eye icon
  const showImagePreview = (e, imageUrl) => {
    const previewImg = e.target.closest('.attachment-item').nextElementSibling;
    
    if (previewImg && previewImg.classList.contains('attachment-preview')) {
      if (previewImg.style.display === 'block') {
        previewImg.style.display = 'none';
        previewImg.src = '';
      } else {
        previewImg.src = imageUrl;
        previewImg.style.display = 'block';
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG');
  };

  if (loading) {
    return (
      <div className="container-tasks">
        <ProjectHeader 
          title="إدارة المشروع"
          description="جاري تحميل بيانات المشروع..."
        />
        <div className="loading-spinner">جاري تحميل بيانات المشروع...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-tasks">
        <ProjectHeader 
          title="إدارة المشروع"
          description="حدث خطأ أثناء تحميل البيانات"
        />
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-tasks">
      {/* Header Component */}
      <ProjectHeader 
        title="إدارة المشروع"
        description={projectData.description || "لا يوجد وصف للمشروع"}
        teamMembers={5}
        startDate="01/01/2023"
        endDate="15/06/2023"
      />
      
      {/* Stages Container */}
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
                    <div key={task.id} className="task-management">
                      <div className="task-title-management">{task.title}</div>
                      {task.description && <div className="task-description-management">{task.description}</div>}
                      <div className="task-meta">
                        <div className="task-responsible">{task.responsible}</div>
                        <div className="task-deadline">{formatDate(task.deadline)}</div>
                      </div>
                      {renderAttachments(task.attachments)}
                      <div className="task-actions">
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
                              
                              const updatedStages = projectData.stages.map(s => {
                                if (s.tasks.some(t => t.id === task.id)) {
                                  return {
                                    ...s,
                                    tasks: s.tasks.map(t => {
                                      if (t.id === task.id) {
                                        const newAttachments = files.map(file => {
                                          const isImage = file.type.startsWith('image/');
                                          const isLink = file.name.startsWith('http') || file.name.startsWith('www');
                                          
                                          return {
                                            type: isImage ? 'image' : (isLink ? 'link' : 'file'),
                                            name: isLink ? 'رابط خارجي' : file.name,
                                            url: isLink ? file.name : URL.createObjectURL(file)
                                          };
                                        });
                                        
                                        return {
                                          ...t,
                                          attachments: [...t.attachments, ...newAttachments]
                                        };
                                      }
                                      return t;
                                    })
                                  };
                                }
                                return s;
                              });
                              
                              setProjectData({
                                ...projectData,
                                stages: updatedStages
                              });
                              
                              alert(`تم إضافة ${files.length} مرفق جديد إلى المهمة`);
                            };
                            
                            fileInput.click();
                          }}
                        >
                          <span className="action-icon">📎</span>
                          <span>إضافة مرفق</span>
                        </button>
                        <button 
                          className="action-btn-management primary" 
                          onClick={() => {
                            setCurrentSubmissionTask(task.id);
                            setShowModal(true);
                          }}
                        >
                          <span className="action-icon">✅</span>
                          <span>إعلام بالإنجاز</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* زر إضافة المهمة - يظهر فقط للقائد */}
              {isLeader && (
                <button 
                  className="toggle-form-btn" 
                  onClick={() => toggleForm(stage.id)}
                >
                  {showForms[stage.id] ? 'إخفاء النموذج' : 'إضافة مهمة جديدة'}
                </button>
              )}

              <div className={`add-task-form ${showForms[stage.id] ? 'show' : ''}`}>
                <div className="form-group-tasks">
                  <label htmlFor={`task-title-management-${stage.id}`}>عنوان المهمة:</label>
                  <input 
                    type="text" 
                    id={`task-title-management-${stage.id}`} 
                    placeholder="أدخل عنوان المهمة"
                    value={newTasks[stage.id]?.title || ''}
                    onChange={(e) => handleNewTaskChange(stage.id, 'title', e.target.value)}
                  />
                </div>
                <div className="form-group-tasks">
                  <label htmlFor={`task-description-management-${stage.id}`}>وصف المهمة (اختياري):</label>
                  <textarea 
                    id={`task-description-management-${stage.id}`} 
                    placeholder="أدخل وصف المهمة"
                    value={newTasks[stage.id]?.description || ''}
                    onChange={(e) => handleNewTaskChange(stage.id, 'description', e.target.value)}
                  ></textarea>
                </div>
                <div className="form-row-tasks">
                  <div className="form-group-tasks">
                    <label htmlFor={`task-responsible-${stage.id}`}>المسؤول:</label>
                    <input 
                      type="text" 
                      id={`task-responsible-${stage.id}`} 
                      placeholder="أدخل اسم المسؤول"
                      value={newTasks[stage.id]?.responsible || ''}
                      onChange={(e) => handleNewTaskChange(stage.id, 'responsible', e.target.value)}
                    />
                  </div>
                  <div className="form-group-tasks">
                    <label htmlFor={`task-deadline-${stage.id}`}>موعد التسليم:</label>
                    <input 
                      type="date" 
                      id={`task-deadline-${stage.id}`}
                      value={newTasks[stage.id]?.deadline || ''}
                      onChange={(e) => handleNewTaskChange(stage.id, 'deadline', e.target.value)}
                    />
                  </div>
                </div>
                <div 
                  className="file-upload-area" 
                  id={`upload-area-${stage.id}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('dragover');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('dragover');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('dragover');
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      handleNewTaskFileChange(stage.id, { target: { files } });
                      const uploadText = e.currentTarget.querySelector('.file-upload-text');
                      const names = Array.from(files).map(f => f.name).join(', ');
                      uploadText.textContent = `تم اختيار: ${names}`;
                    }
                  }}
                >
                  <div className="file-upload-text">
                    {newTasks[stage.id]?.files?.length > 0 ? 
                      `تم اختيار: ${newTasks[stage.id].files.map(f => f.name).join(', ')}` : 
                      'قم بسحب وإسقاط الملفات هنا أو'}
                  </div>
                  <button 
                    className="file-upload-btn"
                    onClick={() => document.getElementById(`file-input-${stage.id}`).click()}
                  >
                    اختر ملفات
                  </button>
                  <input 
                    type="file" 
                    className="file-input" 
                    id={`file-input-${stage.id}`} 
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip,.rar"
                    multiple
                    onChange={(e) => {
                      handleNewTaskFileChange(stage.id, e);
                      const uploadText = document.querySelector(`#upload-area-${stage.id} .file-upload-text`);
                      const names = Array.from(e.target.files).map(f => f.name).join(', ');
                      uploadText.textContent = `تم اختيار: ${names}`;
                    }}
                  />
                </div>
                <button 
                  className="add-task-btn" 
                  onClick={() => addNewTask(stage.id)}
                >
                  إضافة المهمة
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Submission Modal */}
      <div className={`modal-overlay-tasks ${showModal ? 'show' : ''}`}>
        <div className="modal-content-tasks">
          <div className="modal-header">
            إعلام بإكمال المهمة
          </div>
          <div className="modal-body">
            <div className="form-group-tasks">
              <label htmlFor="submissionNotes">ملاحظات حول الإنجاز:</label>
              <textarea 
                id="submissionNotes" 
                placeholder="أدخل ملاحظاتك عن إنجاز المهمة (اختياري)"
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
              ></textarea>
            </div>
            <div 
              className="file-upload-area"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('dragover');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('dragover');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                  setSubmissionFiles(files);
                }
              }}
            >
              <div className="file-upload-text">
                {submissionFiles.length > 0 ? 
                  `تم اختيار: ${submissionFiles.map(f => f.name).join(', ')}` : 
                  'يمكنك إرفاق ملفات إضافية للإنجاز (اختياري)'}
              </div>
              <button 
                className="file-upload-btn"
                onClick={() => document.getElementById('submissionFiles').click()}
              >
                اختر ملفات
              </button>
              <input 
                type="file" 
                className="file-input" 
                id="submissionFiles" 
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
              className="modal-btn secondary" 
              onClick={() => {
                setShowModal(false);
                setCurrentSubmissionTask(null);
                setSubmissionNotes('');
                setSubmissionFiles([]);
              }}
            >
              إلغاء
            </button>
            <button 
              className="modal-btn primary" 
              onClick={confirmSubmission}
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