import React, { useState, useEffect } from 'react';
import './StudentProjectManagement.css';
import ProjectHeader from '../components/Header/ProjectHeader';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const StudentProjectManagement = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const groupId = localStorage.getItem('selectedGroupId');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLeader, setIsLeader] = useState(false);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [showForms, setShowForms] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentSubmissionTask, setCurrentSubmissionTask] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [newTasks, setNewTasks] = useState({});
  const [githubRepo, setGithubRepo] = useState('');
  const [githubCommitUrl, setGithubCommitUrl] = useState('');
  const [commitDescription, setCommitDescription] = useState('');
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [currentTaskToGrade, setCurrentTaskToGrade] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [newStage, setNewStage] = useState({
    title: '',
    description: '',
    due_date: ''
  });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentTaskDetails, setCurrentTaskDetails] = useState(null);
  const [showStageSubmissionModal, setShowStageSubmissionModal] = useState(false);
  const [currentStageToSubmit, setCurrentStageToSubmit] = useState(null);
  const [stageSubmissionNotes, setStageSubmissionNotes] = useState('');
  const [stageSubmissionFiles, setStageSubmissionFiles] = useState([]);
  const [showStageGradeModal, setShowStageGradeModal] = useState(false);
  const [currentStageToGrade, setCurrentStageToGrade] = useState(null);
  const [stageGrade, setStageGrade] = useState('');
  const [stageFeedback, setStageFeedback] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch current user
  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await axios.get('http://127.0.0.1:8000/api/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCurrentUser(res.data);
      return res.data;
    }
  });

  // Check if supervisor
  const { data: supervisorStatus } = useQuery({
    queryKey: ['isSupervisor', groupId],
    queryFn: async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/groups/${groupId}/is-supervisor`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setIsSupervisor(res.data.is_supervisor);
        return res.data.is_supervisor;
      } catch (error) {
        setIsSupervisor(false);
        return false;
      }
    },
    enabled: !!groupId
  });

  // Check if leader (only if not supervisor)
  const { data: leaderStatus } = useQuery({
    queryKey: ['isLeader', groupId],
    queryFn: async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/groups/${groupId}/is-leader`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setIsLeader(res.data.is_leader);
        return res.data.is_leader;
      } catch (error) {
        setIsLeader(false);
        return false;
      }
    },
    enabled: !!groupId && !isSupervisor
  });

  // Fetch group students
  const { data: groupStudents = [] } = useQuery({
    queryKey: ['groupStudents', groupId],
    queryFn: async () => {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/groups/${groupId}/students`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      return res.data.data || [];
    },
    enabled: !!groupId
  });

  // Fetch project stages with tasks
  const { data: projectData, isLoading, isError, error, refetch: refetchProject } = useQuery({
    queryKey: ['projectStages', groupId],
    queryFn: async () => {
      const stagesRes = await axios.get(
        `http://127.0.0.1:8000/api/group-stages/${groupId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!stagesRes.data?.data) return { title: "", description: "", stages: [] };

      const stagesWithTasks = await Promise.all(
        stagesRes.data.data.map(async (stage) => {
          const tasksRes = await axios.get(
            `http://127.0.0.1:8000/api/stages/${stage.id}/tasks`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );

          const tasksWithGradingStatus = await Promise.all(
            tasksRes.data.map(async task => {
              let gradingStatus = {};
              if (task.status === 'completed') {
                try {
                  const gradingRes = await axios.get(
                    `http://127.0.0.1:8000/api/tasks/${task.id}/grading-status`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                  );
                  gradingStatus = gradingRes.data;
                } catch (err) {
                  console.error('Error fetching grading status:', err);
                }
              }

              return {
                id: task.id,
                title: task.title,
                description: task.description,
                responsible: task.assignee?.user?.name || 'غير محدد',
                responsibleId: task.assigned_to,
                deadline: task.due_date,
                status: task.status,
                priority: task.priority,
                grade: gradingStatus.grade,
                feedback: gradingStatus.feedback,
                attachments: []
              };
            })
          );

          return {
            id: stage.id,
            name: stage.title,
            deadline: stage.due_date,
            description: stage.description,
            tasks: tasksWithGradingStatus
          };
        })
      );

      return {
        title: "",
        description: "",
        stages: stagesWithTasks
      };
    },
    enabled: !!groupId
  });

  // Fetch stage submissions
  const { data: stageSubmissions = {} } = useQuery({
    queryKey: ['stageSubmissions', groupId],
    queryFn: async () => {
      if (!projectData?.stages) return {};
      
      const submissions = {};
      await Promise.all(
        projectData.stages.map(async stage => {
          try {
            const submissionRes = await axios.get(
              `http://127.0.0.1:8000/api/stages/${stage.id}/submission`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (submissionRes.data.data) {
              submissions[stage.id] = submissionRes.data.data;
            }
          } catch (error) {
            console.log('No submission found for stage', stage.id);
          }
        })
      );
      return submissions;
    },
    enabled: !!projectData?.stages
  });

  // Mutations
  const addTaskMutation = useMutation({
    mutationFn: async ({ stageId, taskData }) => {
      const res = await axios.post(
        'http://127.0.0.1:8000/api/tasks',
        {
          project_stage_id: stageId,
          title: taskData.title,
          description: taskData.description || '',
          assigned_to: parseInt(taskData.responsibleId),
          due_date: taskData.deadline,
          priority: taskData.priority || 'medium'
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      return res.data;
    },
    onSuccess: (data, { stageId }) => {
      queryClient.invalidateQueries(['projectStages', groupId]);
      setNewTasks(prev => ({ ...prev, [stageId]: {} }));
      setShowForms(prev => ({ ...prev, [stageId]: false }));
      setSuccessMessage('تم إضافة المهمة بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      console.error('Error:', error);
      alert('حدث خطأ أثناء إضافة المهمة: ' + (error.response?.data?.message || error.message));
    }
  });

  const submitTaskMutation = useMutation({
    mutationFn: async ({ taskId, formData }) => {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/tasks/${taskId}/submit`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['projectStages', groupId]);
      setShowModal(false);
      setCurrentSubmissionTask(null);
      setSubmissionNotes('');
      setSubmissionFiles([]);
      setGithubRepo('');
      setGithubCommitUrl('');
      setCommitDescription('');
      setSuccessMessage('تم تسليم المهمة بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      console.error('Error submitting task:', error);
      alert('حدث خطأ أثناء تسليم المهمة: ' + (error.response?.data?.message || error.message));
    }
  });

  const gradeTaskMutation = useMutation({
    mutationFn: async ({ taskId, gradeData }) => {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/tasks/${taskId}/grade`,
        gradeData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['projectStages', groupId]);
      setShowGradeModal(false);
      setCurrentTaskToGrade(null);
      setGrade('');
      setFeedback('');
      setSuccessMessage('تم تقييم المهمة بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      console.error('Error grading task:', error);
      alert('حدث خطأ أثناء تقييم المهمة: ' + (error.response?.data?.message || error.message));
    }
  });

  const addStageMutation = useMutation({
    mutationFn: async (stageData) => {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/groups/${groupId}/stages`,
        {
          group_id: groupId,
          title: stageData.title,
          description: stageData.description || '',
          due_date: stageData.due_date
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['projectStages', groupId]);
      setNewStage({
        title: '',
        description: '',
        due_date: ''
      });
      setShowAddStageModal(false);
      setSuccessMessage('تم إضافة المرحلة بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      console.error('Error adding stage:', error);
      alert('حدث خطأ أثناء إضافة المرحلة: ' + (error.response?.data?.message || error.message));
    }
  });

  const submitStageMutation = useMutation({
    mutationFn: async ({ stageId, formData }) => {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/project-stages/${stageId}/submit`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stageSubmissions', groupId]);
      setShowStageSubmissionModal(false);
      setCurrentStageToSubmit(null);
      setStageSubmissionNotes('');
      setStageSubmissionFiles([]);
      setSuccessMessage('تم تسليم المرحلة بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      console.error('Error submitting stage:', error);
      alert('حدث خطأ أثناء تسليم المرحلة: ' + (error.response?.data?.message || error.message));
    }
  });

  const gradeStageMutation = useMutation({
    mutationFn: async ({ stageId, gradeData }) => {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/stages/${stageId}/evaluate`,
        gradeData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stageSubmissions', groupId]);
      setShowStageGradeModal(false);
      setCurrentStageToGrade(null);
      setStageGrade('');
      setStageFeedback('');
      setSuccessMessage('تم تقييم المرحلة بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      console.error('Error grading stage:', error);
      alert('حدث خطأ أثناء تقييم المرحلة: ' + (error.response?.data?.message || error.message));
    }
  });

  // Helper functions
  const isTaskAssignedToCurrentUser = (task) => {
    return currentUser?.student?.studentId === task.responsibleId;
  };

  const toggleForm = (stageId) => {
    setShowForms(prev => ({ ...prev, [stageId]: !prev[stageId] }));
    if (!newTasks[stageId]) {
      setNewTasks(prev => ({ ...prev, [stageId]: {} }));
    }
  };

  const handleSubmissionFileChange = (e) => {
    setSubmissionFiles(Array.from(e.target.files));
  };

  const handleStageSubmissionFileChange = (e) => {
    setStageSubmissionFiles(Array.from(e.target.files));
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

  const addNewTask = (stageId) => {
    const newTaskData = newTasks[stageId];
    if (!newTaskData?.title || !newTaskData?.responsibleId) {
      return alert('الرجاء إدخال عنوان المهمة واختيار المسؤول');
    }
    addTaskMutation.mutate({ stageId, taskData: newTaskData });
  };

  const submitTaskToAPI = () => {
    if (!currentSubmissionTask) return;

    const formData = new FormData();
    formData.append('content', submissionNotes);
    formData.append('github_repo', githubRepo);
    formData.append('github_commit_url', githubCommitUrl);
    formData.append('commit_description', commitDescription);
    submissionFiles.forEach(file => {
      formData.append('attachment', file);
    });

    submitTaskMutation.mutate({ 
      taskId: currentSubmissionTask, 
      formData 
    });
  };

  const submitStageToAPI = () => {
    if (!currentStageToSubmit) return;

    const formData = new FormData();
    formData.append('notes', stageSubmissionNotes);
    stageSubmissionFiles.forEach(file => {
      formData.append('attachments[]', file);
    });

    submitStageMutation.mutate({ 
      stageId: currentStageToSubmit, 
      formData 
    });
  };

  const evaluateStage = () => {
    if (!currentStageToGrade || !stageGrade) {
      return alert('الرجاء إدخال العلامة');
    }

    gradeStageMutation.mutate({
      stageId: currentStageToGrade,
      gradeData: {
        grade: parseInt(stageGrade),
        feedback: stageFeedback || '',
        status: 'reviewed'
      }
    });
  };

  const handleGradeTask = () => {
    if (!currentTaskToGrade || !grade) {
      return alert('الرجاء إدخال العلامة');
    }

    gradeTaskMutation.mutate({
      taskId: currentTaskToGrade,
      gradeData: {
        grade: parseInt(grade),
        feedback: feedback || ''
      }
    });
  };

  const handleAddStage = () => {
    if (!newStage.title || !newStage.due_date) {
      return alert('الرجاء إدخال عنوان المرحلة وتاريخ التسليم');
    }
    addStageMutation.mutate(newStage);
  };

  const showTaskDetails = (task) => {
    setCurrentTaskDetails(task);
    setShowTaskModal(true);
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

  const renderStageSubmissionStatus = (stageId) => {
    const submission = stageSubmissions[stageId];
    
    if (!submission) {
      return (
        <span className="stage-submission-status not-submitted">
          <i className="fas fa-times-circle"></i> غير مسلمة
        </span>
      );
    }

    if (submission.status === 'submitted') {
      return (
        <span className="stage-submission-status submitted">
          <i className="fas fa-clock"></i> مسلمة - بانتظار التقييم
        </span>
      );
    }

    if (submission.status === 'reviewed') {
      return (
        <span className="stage-submission-status graded">
          <i className="fas fa-check-circle"></i> مسلمة ومقيمة ({submission.grade}/100)
        </span>
      );
    }

    return null;
  };

  const renderTaskActions = (task) => {
    return (
      <>
        <button 
          className="action-btn-management" 
          onClick={() => showTaskDetails(task)}
        >
          <span className="action-icon">👁️</span>
          <span>عرض التفاصيل</span>
        </button>

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

        {isSupervisor && task.status === 'completed' && (
          <button 
            className="action-btn-management grade-btn" 
            onClick={async () => {
              try {
                const token = localStorage.getItem('access_token');
                const gradingRes = await axios.get(
                  `http://127.0.0.1:8000/api/tasks/${task.id}/grading-status`,
                  { headers: { 'Authorization': `Bearer ${token}` } }
                );
                setCurrentTaskToGrade(task.id);
                setGrade(gradingRes.data.grade || '');
                setFeedback(gradingRes.data.feedback || '');
                setShowGradeModal(true);
              } catch (err) {
                console.error('Error checking grading status:', err);
                setCurrentTaskToGrade(task.id);
                setGrade('');
                setFeedback('');
                setShowGradeModal(true);
              }
            }}
          >
            <span className="action-icon">⭐</span>
            <span>{task.grade ? 'تعديل التقييم' : 'تقييم المهمة'}</span>
          </button>
        )}
      </>
    );
  };

  const renderTaskGrade = (task) => {
    if (task.status !== 'completed') return null;

    return (
      <div className="task-grade-container">
        <div className="task-grade-info">
          {task.grade ? (
            <>
              <span className="grade-label">العلامة:</span>
              <span className="grade-value">{task.grade}/100</span>
              {task.feedback && (
                <>
                  <span className="feedback-label">التعليق:</span>
                  <span className="feedback-value">{task.feedback}</span>
                </>
              )}
            </>
          ) : isSupervisor ? (
            <span className="not-graded">لم يتم التقييم بعد</span>
          ) : (
            <span className="not-graded">بانتظار التقييم من المشرف</span>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) return (
    <div className="container-tasks">
      <ProjectHeader title="إدارة المشروع" description="جاري تحميل البيانات..." />
      <div className="loading-spinner">جاري تحميل بيانات المشروع...</div>
    </div>
  );

  if (isError) return (
    <div className="container-tasks">
      <ProjectHeader title="إدارة المشروع" description="حدث خطأ أثناء تحميل البيانات" />
      <div className="error-message">{error.message}</div>
    </div>
  );

  if (!projectData) return (
    <div className="container-tasks">
      <ProjectHeader title="إدارة المشروع" description="لا يوجد بيانات للمشروع" />
      <div className="error-message">لا توجد بيانات متاحة للمشروع</div>
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
      {isSupervisor && (
        <div className="add-stage-btn-container">
          <button 
            className="add-stage-btn"
            onClick={() => setShowAddStageModal(true)}
          >
            إضافة مرحلة جديدة
          </button>
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          {successMessage}
          <button onClick={() => setSuccessMessage('')} className="close-message">
            ×
          </button>
        </div>
      )}
      
      <div className="stages-container">
        {projectData.stages.length === 0 ? (
          <div className="no-stages-message">لا توجد مراحل متاحة لهذا المشروع حتى الآن</div>
        ) : (
          projectData.stages.map(stage => (
            <div key={stage.id} className="stage">
              <div className="stage-header">
                <div className="stage-title-container">
                  <div className="stage-title">{stage.name}</div>
                  {renderStageSubmissionStatus(stage.id)}
                </div>
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
                      {renderTaskGrade(task)}
                      <div className="task-actions">
                        {renderTaskActions(task)}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {(isLeader || isSupervisor) && (
                <>
                  <button 
                    className="toggle-form-btn" 
                    onClick={() => toggleForm(stage.id)}
                  >
                    {showForms[stage.id] ? 'إخفاء النموذج' : 'إضافة مهمة جديدة'}
                  </button>

                  {showForms[stage.id] && (
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
                </>
              )}

              {/* Stage Submission Button - Visible to all except supervisor */}
              {!isSupervisor && (
                <button 
                  className="submit-stage-btn"
                  onClick={() => {
                    setCurrentStageToSubmit(stage.id);
                    setShowStageSubmissionModal(true);
                  }}
                >
                  تسليم المرحلة
                </button>
              )}

              {/* Stage Grade Button - Visible only to supervisor */}
              {isSupervisor && stageSubmissions[stage.id] && stageSubmissions[stage.id].status === 'submitted' && (
                <button 
                  className="grade-stage-btn"
                  onClick={() => {
                    setCurrentStageToGrade(stage.id);
                    setStageGrade(stageSubmissions[stage.id]?.grade || '');
                    setStageFeedback(stageSubmissions[stage.id]?.feedback || '');
                    setShowStageGradeModal(true);
                  }}
                >
                  تقييم المرحلة
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Submission Modal */}
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
              className="modal-btn primary" 
              onClick={submitTaskToAPI}
              disabled={!githubRepo || !githubCommitUrl || !commitDescription}
            >
              تأكيد الإنجاز
            </button>
          </div>
        </div>
      </div>

     {/* Grade Modal */}
     <div className={`modal-overlay-tasks ${showGradeModal ? 'show' : ''}`}>
        <div className="modal-content-tasks">
          <div className="modal-header-spm">تقييم المهمة</div>
          <div className="modal-body">
            <div className="form-group-tasks">
              <label htmlFor="grade">العلامة (من 100):</label>
              <input 
                type="number" 
                id="grade"
                min="0"
                max="100"
                placeholder="أدخل العلامة من 0 إلى 100"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                required
              />
            </div>

            <div className="form-group-tasks">
              <label htmlFor="feedback">التعليق (اختياري):</label>
              <textarea 
                id="feedback"
                placeholder="أدخل تعليقك على المهمة"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button"
              className="modal-btn secondary" 
              onClick={() => {
                setShowGradeModal(false);
                setCurrentTaskToGrade(null);
                setGrade('');
                setFeedback('');
              }}
            >
              إلغاء
            </button>
            <button 
              type="button"
              className="modal-btn primary" 
              onClick={handleGradeTask}
              disabled={!grade}
            >
              حفظ التقييم
            </button>
          </div>
        </div>
      </div>

      {/* Stage Grade Modal */}
      <div className={`modal-overlay-tasks ${showStageGradeModal ? 'show' : ''}`}>
        <div className="modal-content-tasks">
          <div className="modal-header-spm">تقييم المرحلة</div>
          <div className="modal-body">
            <div className="form-group-tasks">
              <label htmlFor="stageGrade">العلامة (من 100):</label>
              <input 
                type="number" 
                id="stageGrade"
                min="0"
                max="100"
                placeholder="أدخل العلامة من 0 إلى 100"
                value={stageGrade}
                onChange={(e) => setStageGrade(e.target.value)}
                required
              />
            </div>

            <div className="form-group-tasks">
              <label htmlFor="stageFeedback">التعليق (اختياري):</label>
              <textarea 
                id="stageFeedback"
                placeholder="أدخل تعليقك على المرحلة"
                value={stageFeedback}
                onChange={(e) => setStageFeedback(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button"
              className="modal-btn secondary" 
              onClick={() => {
                setShowStageGradeModal(false);
                setCurrentStageToGrade(null);
                setStageGrade('');
                setStageFeedback('');
              }}
            >
              إلغاء
            </button>
            <button 
              type="button"
              className="modal-btn primary" 
              onClick={evaluateStage}
              disabled={!stageGrade}
            >
              حفظ التقييم
            </button>
          </div>
        </div>
      </div>

      {/* Stage Submission Modal */}
      <div className={`modal-overlay-tasks ${showStageSubmissionModal ? 'show' : ''}`}>
        <div className="modal-content-tasks">
          <div className="modal-header-spm">تسليم المرحلة</div>
          <div className="modal-body">
            <div className="form-group-tasks">
              <label htmlFor="stageSubmissionNotes">ملاحظات حول التسليم:</label>
              <textarea 
                id="stageSubmissionNotes"
                placeholder="أدخل ملاحظاتك حول تسليم المرحلة (اختياري)"
                value={stageSubmissionNotes}
                onChange={(e) => setStageSubmissionNotes(e.target.value)}
              />
            </div>

            <div 
              className="file-upload-area"
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setStageSubmissionFiles(Array.from(e.dataTransfer.files));
              }}
            >
              <div className="file-upload-text">
                {stageSubmissionFiles.length > 0 ? 
                  `تم اختيار: ${stageSubmissionFiles.map(f => f.name).join(', ')}` : 
                  'قم بسحب وإسقاط الملفات هنا أو'}
              </div>
              <button 
                type="button"
                onClick={() => document.getElementById('stageSubmissionFiles').click()}
              >
                اختر ملفات
              </button>
              <input 
                type="file" 
                id="stageSubmissionFiles"
                className="file-input"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip,.rar"
                multiple
                onChange={handleStageSubmissionFileChange}
              />
            </div>
            <div className="file-preview">
              {stageSubmissionFiles.map((file, index) => (
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
                setShowStageSubmissionModal(false);
                setCurrentStageToSubmit(null);
                setStageSubmissionNotes('');
                setStageSubmissionFiles([]);
              }}
            >
              إلغاء
            </button>
            <button 
              type="button"
              className="modal-btn primary" 
              onClick={submitStageToAPI}
            >
              تأكيد التسليم
            </button>
          </div>
        </div>
      </div>

      {/* Add Stage Modal */}
      <div className={`modal-overlay-tasks ${showAddStageModal ? 'show' : ''}`}>
        <div className="modal-content-tasks">
          <div className="modal-header-spm">إضافة مرحلة جديدة</div>
          <div className="modal-body">
            <div className="form-group-tasks">
              <label htmlFor="stageTitle">عنوان المرحلة:</label>
              <input 
                type="text" 
                id="stageTitle"
                placeholder="أدخل عنوان المرحلة"
                value={newStage.title}
                onChange={(e) => setNewStage({...newStage, title: e.target.value})}
                required
              />
            </div>

            <div className="form-group-tasks">
              <label htmlFor="stageDescription">وصف المرحلة (اختياري):</label>
              <textarea 
                id="stageDescription"
                placeholder="أدخل وصف المرحلة"
                value={newStage.description}
                onChange={(e) => setNewStage({...newStage, description: e.target.value})}
              />
            </div>

            <div className="form-group-tasks">
              <label htmlFor="stageDueDate">موعد التسليم:</label>
              <input 
                type="date" 
                id="stageDueDate"
                value={newStage.due_date}
                onChange={(e) => setNewStage({...newStage, due_date: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button"
              className="modal-btn secondary" 
              onClick={() => {
                setShowAddStageModal(false);
                setNewStage({
                  title: '',
                  description: '',
                  due_date: ''
                });
              }}
            >
              إلغاء
            </button>
            <button 
              type="button"
              className="modal-btn primary" 
              onClick={handleAddStage}
              disabled={!newStage.title || !newStage.due_date}
            >
              إضافة المرحلة
            </button>
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      <div className={`modal-overlay-tasks ${showTaskModal ? 'show' : ''}`}>
        <div className="modal-content-tasks">
          <div className="modal-header-spm">تفاصيل المهمة</div>
          <div className="modal-body">
            {currentTaskDetails && (
              <>
                <div className="task-detail-row">
                  <span className="task-detail-label">عنوان المهمة:</span>
                  <span className="task-detail-value">{currentTaskDetails.title}</span>
                </div>
                
                {currentTaskDetails.description && (
                  <div className="task-detail-row">
                    <span className="task-detail-label">الوصف:</span>
                    <span className="task-detail-value">{currentTaskDetails.description}</span>
                  </div>
                )}
                
                <div className="task-detail-row">
                  <span className="task-detail-label">المسؤول:</span>
                  <span className="task-detail-value">{currentTaskDetails.responsible}</span>
                </div>
                
                <div className="task-detail-row">
                  <span className="task-detail-label">الحالة:</span>
                  <span className="task-detail-value">
                    {currentTaskDetails.status === 'completed' ? 'مكتمل' : 
                     currentTaskDetails.status === 'in_progress' ? 'قيد التنفيذ' : 
                     currentTaskDetails.status === 'pending' ? 'قيد الانتظار' : 'غير محدد'}
                  </span>
                </div>
                
                <div className="task-detail-row">
                  <span className="task-detail-label">الأولوية:</span>
                  <span className="task-detail-value">
                    {currentTaskDetails.priority === 'high' ? 'عالي' : 
                     currentTaskDetails.priority === 'medium' ? 'متوسط' : 
                     currentTaskDetails.priority === 'low' ? 'منخفض' : 'غير محدد'}
                  </span>
                </div>
                
                <div className="task-detail-row">
                  <span className="task-detail-label">الموعد النهائي:</span>
                  <span className="task-detail-value">{formatDate(currentTaskDetails.deadline)}</span>
                </div>
                
                {currentTaskDetails.attachments?.length > 0 && (
                  <div className="task-detail-row">
                    <span className="task-detail-label">المرفقات:</span>
                    <div className="task-attachments-container">
                      {currentTaskDetails.attachments.map((attachment, index) => (
                        <div key={index} className="attachment-item">
                          <a href={attachment.url} className="attachment-link" target="_blank" rel="noopener noreferrer">
                            <span className="attachment-icon">
                              {attachment.type === 'image' ? '🖼️' : '📄'}
                            </span>
                            {attachment.name}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {currentTaskDetails.status === 'completed' && (
                  <>
                    <div className="task-detail-row">
                      <span className="task-detail-label">التقييم:</span>
                      <span className="task-detail-value">
                        {currentTaskDetails.grade ? `${currentTaskDetails.grade}/100` : 'لم يتم التقييم بعد'}
                      </span>
                    </div>
                    
                    {currentTaskDetails.feedback && (
                      <div className="task-detail-row">
                        <span className="task-detail-label">التعليق:</span>
                        <span className="task-detail-value">{currentTaskDetails.feedback}</span>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
          <div className="modal-footer">
            <button 
              type="button"
              className="modal-btn primary" 
              onClick={() => setShowTaskModal(false)}
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProjectManagement;