import React from 'react';
import './SuperManageCoordinator.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav';
const SuperManageCoordinator = () => {
  const supervisors = [
    {
      name: "د. أحمد محمد",
      studentCount: 8,
      students: [
        "سلطان عبدالله",
        "ريم خالد",
        "فهد ناصر",
        "نورة أحمد",
        "خالد سليمان",
        "أمل فارس",
        "عبدالرحمن محمد",
        "هند علي"
      ]
    },
    {
      name: "د. سارة الخالد",
      studentCount: 5,
      students: [
        "علي محمد",
        "لمى عبدالعزيز",
        "أحمد ناصر",
        "سحر خالد",
        "ناصر أحمد"
      ]
    },
    {
      name: "د. محمد السعد",
      studentCount: 6,
      students: [
        "تركي فيصل",
        "جوهرة عبدالله",
        "ياسر خالد",
        "أروى ناصر",
        "سعد علي",
        "دانة محمد"
      ]
    }
  ];

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
    </section>
    </div>
    </div>
  );
};

export default SuperManageCoordinator;