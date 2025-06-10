import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faClock, 
  faDoorOpen, 
  faUserTie, 
  faClipboardCheck,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import './DiscussionsStudent.css';
import ProjectHeader from '../components/Header/ProjectHeader';
const DiscussionsStudent = () => {
  const [activeTab, setActiveTab] = useState('intermediate');

  const openTab = (tabName) => {
    setActiveTab(tabName);
  };

  // بيانات المناقشات المرحلية
  const intermediateDiscussions = [
    {
      id: 1,
      title: "يوم الاثنين - المناقشات المرحلية",
      date: "10 ديسمبر 2023",
      groups: [
        {
          id: 1,
          name: "المجموعة الدراسية",
          time: "9:00 صباحًا",
          hall: "قاعة 101 (مبنى الإدارة)",
          supervisor: "د. أحمد محمد"
        }
      ]
    },
    {
      id: 2,
      title: "يوم الأربعاء - المناقشات المرحلية",
      date: "12 ديسمبر 2023",
      groups: [
        {
          id: 2,
          name: "المجموعة الثالثة",
          time: "8:30 صباحًا",
          hall: "قاعة 105 (مبنى الإدارة)",
          supervisor: "د. خالد حسن"
        },
        {
          id: 3,
          name: "المجموعة الرابعة",
          time: "2:00 مساءً",
          hall: "قاعة 301 (المبنى الرئيسي)",
          supervisor: "د. محمد علي"
        }
      ]
    }
  ];

  // بيانات المناقشات النهائية
  const finalDiscussions = [
    {
      id: 1,
      title: "يوم الأحد - المناقشات النهائية",
      date: "7 يناير 2024",
      groups: [
        {
          id: 1,
          name: "المجموعة الأولى",
          time: "10:00 صباحًا",
          hall: "القاعة الكبرى (المبنى الرئيسي)",
          supervisor: "د. أحمد محمد",
          attendance: "إلزامي لجميع أعضاء اللجنة"
        },
        {
          id: 2,
          name: "المجموعة الثانية",
          time: "1:30 مساءً",
          hall: "القاعة الكبرى (المبنى الرئيسي)",
          supervisor: "أ. سارة عبد الله",
          attendance: "إلزامي لجميع أعضاء اللجنة"
        }
      ]
    },
    {
      id: 2,
      title: "يوم الثلاثاء - المناقشات النهائية",
      date: "9 يناير 2024",
      groups: [
        {
          id: 3,
          name: "المجموعة الثالثة",
          time: "9:00 صباحًا",
          hall: "قاعة 205 (مبنى المختبرات)",
          supervisor: "د. خالد حسن",
          attendance: "إلزامي لجميع أعضاء اللجنة"
        },
        {
          id: 4,
          name: "المجموعة الرابعة",
          time: "3:00 مساءً",
          hall: "قاعة 305 (المبنى الرئيسي)",
          supervisor: "د. محمد علي",
          attendance: "إلزامي لجميع أعضاء اللجنة"
        }
      ]
    }
  ];

  return (
    <div className="discussions-container" dir="rtl">
       <ProjectHeader 
        title="مشروع تطوير نظام إدارة المجموعات"
        description="هذا المشروع يهدف إلى تطوير نظام متكامل لإدارة مشاريع المجموعات في الجامعة، حيث يمكن توزيع المهام ومتابعة التقدم والإنجاز بشكل فعال."
        teamMembers={5}
        startDate="01/01/2023"
        endDate="15/06/2023"
      />
      
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'intermediate' ? 'active' : ''}`}
          onClick={() => openTab('intermediate')}
        >
          المناقشات المرحلية
        </button>
        <button 
          className={`tab-btn ${activeTab === 'final' ? 'active' : ''}`}
          onClick={() => openTab('final')}
        >
          المناقشات النهائية
        </button>
      </div>
      
      <div id="intermediate" className={`tab-content ${activeTab === 'intermediate' ? 'active' : ''}`}>
        {intermediateDiscussions.map((discussion) => (
          <div className="date-card" key={discussion.id}>
            <div className="date-header">
              <div className="date-title">{discussion.title}</div>
              <div className="date">{discussion.date}</div>
            </div>
            
            <div className="group-container">
              {discussion.groups.map((group) => (
                <div className="group-card" key={group.id}>
                  <div className="group-title">
                    <FontAwesomeIcon icon={faUsers} />
                    {group.name}
                  </div>
                  <div className="group-details">
                    <div className="detail-item">
                      <FontAwesomeIcon icon={faClock} />
                      <span>الوقت: <span className="detail-value">{group.time}</span></span>
                    </div>
                    <div className="detail-item">
                      <FontAwesomeIcon icon={faDoorOpen} />
                      <span>القاعة: <span className="detail-value">{group.hall}</span></span>
                    </div>
                    <div className="detail-item">
                      <FontAwesomeIcon icon={faUserTie} />
                      <span>المشرف: <span className="detail-value">{group.supervisor}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div id="final" className={`tab-content ${activeTab === 'final' ? 'active' : ''}`}>
        {finalDiscussions.map((discussion) => (
          <div className="date-card" key={discussion.id}>
            <div className="date-header">
              <div className="date-title">{discussion.title}</div>
              <div className="date">{discussion.date}</div>
            </div>
            
            <div className="group-container">
              {discussion.groups.map((group) => (
                <div className="group-card" key={group.id}>
                  <div className="group-title">
                    <FontAwesomeIcon icon={faUsers} />
                    {group.name}
                  </div>
                  <div className="group-details">
                    <div className="detail-item">
                      <FontAwesomeIcon icon={faClock} />
                      <span>الوقت: <span className="detail-value">{group.time}</span></span>
                    </div>
                    <div className="detail-item">
                      <FontAwesomeIcon icon={faDoorOpen} />
                      <span>القاعة: <span className="detail-value">{group.hall}</span></span>
                    </div>
                    <div className="detail-item">
                      <FontAwesomeIcon icon={faUserTie} />
                      <span>المشرف: <span className="detail-value">{group.supervisor}</span></span>
                    </div>
                    <div className="detail-item">
                      <FontAwesomeIcon icon={faClipboardCheck} />
                      <span>الحضور: <span className="detail-value">{group.attendance}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscussionsStudent;