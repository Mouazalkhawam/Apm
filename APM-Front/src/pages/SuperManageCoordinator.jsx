import React, { useEffect, useState } from 'react';
import './SuperManageCoordinator.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav';
import axios from 'axios';

const SuperManageCoordinator = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const token = localStorage.getItem('access_token');

  axios.get('http://localhost:8000/api/supervisors/students-names', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(response => {
    if (response.data.success) {
      const data = response.data.data.map(item => ({
        name: item.supervisor_name,
        students: item.students,
        studentCount: item.students.length
      }));
      setSupervisors(data);
    } else {
      console.error("Error:", response.data.message);
    }
  })
  .catch(error => {
    console.error("API Error:", error);
  })
  .finally(() => {
    setLoading(false);
  });
}, []);
 

  return (
    <div className="dashboard-container-dash">
      <Sidebar />
      <div className="scheduling-container">
        <TopNav />

        <section className="supervisors-section">
          <div className="form-title">
            <h1 className='form-title'>المشرفون الأكاديميون</h1>
            <p>قائمة بالمشرفين الأكاديميين والطلاب المشرف عليهم</p>
          </div>

          {loading ? (
            <div className="loading">جاري تحميل البيانات...</div>
          ) : (
            <div className="supervisors-container">
              {supervisors.map((supervisor, index) => (
                <div className="supervisor-card" key={index} style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
                  <div className="supervisor-header">
                    <h3>{supervisor.name}</h3>
                    <span className="students-count">{supervisor.studentCount} طلاب</span>
                  </div>
                  <ul className="students-list">
                    {supervisor.students.map((student, studentIndex) => (
                      <li key={studentIndex}>
                        <FontAwesomeIcon icon={faUser} className="student-icon" />
                        {student}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SuperManageCoordinator;
