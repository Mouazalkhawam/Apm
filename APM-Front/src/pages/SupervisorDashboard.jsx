import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import './SupervisorDashboard.css';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav';

const SupervisorDashboard = () => {
  return (
     <div className="dashboard-container-dash">
        
         <TopNav />
         <div className="main-container">
            <Sidebar />
    <div className="supervisor-dashboard">
        
      <main className="main-content">
        
        <h1 className="page-title">نظرة عامة</h1>
        
        <div className="stats-container-dash-super">
          <div className="stat-card-dash-super">
            <h3>المشاريع النشطة</h3>
            <div className="value">7</div>
            <div className="subtext">+2 عن الشهر الماضي</div>
          </div>
          
          <div className="stat-card-dash-super">
            <h3>المهام المعلقة</h3>
            <div className="value">14</div>
            <div className="subtext">3 منها متأخرة</div>
          </div>
          
          <div className="stat-card-dash-super">
            <h3>الطلاب النشطين</h3>
            <div className="value">23</div>
            <div className="subtext">من أصل 28 طالب</div>
          </div>
          
          <div className="stat-card-dash-super">
            <h3>إجمالي الدرجات</h3>
            <div className="value">88%</div>
            <div className="subtext">متوسط أداء الطلاب</div>
          </div>
        </div>
        
        <section className="projects-section">
          <div className="section-header-dash-super">
            <h2 className="section-title">المشاريع المشرف عليها</h2>
            <a href="#" className="view-all">عرض الكل</a>
          </div>
          
          <div className="projects-grid-dash-super">
            <div className="project-card-dash-super">
              <h3 className="project-title-dash-super">نظام إدارة المشاريع</h3>
              <div className="project-meta">
                <span>4 طلاب</span>
                <span>تاريخ التسليم: 15 يونيو</span>
              </div>
              <div className="progress-bar-dash-super">
                <div className="progress" style={{width: '75%'}}></div>
              </div>
            </div>
            
            <div className="project-card-dash-super">
              <h3 className="project-title-dash-supe">تطبيق الجوال التعليمي</h3>
              <div className="project-meta">
                <span>3 طلاب</span>
                <span>تاريخ التسليم: 22 يونيو</span>
              </div>
              <div className="progress-bar-dash-super">
                <div className="progress" style={{width: '45%'}}></div>
              </div>
            </div>
            
            <div className="project-card-dash-super">
              <h3 className="project-title-dash-supe">موقع التجارة الإلكترونية</h3>
              <div className="project-meta">
                <span>5 طلاب</span>
                <span>تاريخ التسليم: 30 يونيو</span>
              </div>
              <div className="progress-bar-dash-super">
                <div className="progress" style={{width: '30%'}}></div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="tasks-section">
          <div className="section-header-dash-super">
            <h2 className="section-title">المهام المعلقة</h2>
            <a href="#" className="view-all">عرض الكل</a>
          </div>
          
          <ul className="tasks-list">
            <li className="task-item-dash-super">
              <div className="task-info">
                <h4 className="task-title-dash-super">مراجعة كود نظام المشاريع</h4>
                <span className="task-project">نظام إدارة المشاريع</span>
              </div>
              <span className="task-due">غدًا</span>
              <span className="task-status status-pending">في الانتظار</span>
            </li>
            
            <li className="task-item-dash-super">
              <div className="task-info">
                <h4 className="task-title-dash-super">تقديم ملاحظات على التصميم</h4>
                <span className="task-project">تطبيق الجوال التعليمي</span>
              </div>
              <span className="task-due">3 أيام</span>
              <span className="task-status status-pending">في الانتظار</span>
            </li>
            
            <li className="task-item-dash-super">
              <div className="task-info">
                <h4 className="task-title-dash-super">تقييم اختبار الوحدة</h4>
                <span className="task-project">موقع التجارة الإلكترونية</span>
              </div>
              <span className="task-due">متأخر 2 أيام</span>
              <span className="task-status status-overdue">متأخر</span>
            </li>
            
            <li className="task-item-dash-super">
              <div className="task-info">
                <h4 className="task-title-dash-super">مقابلة الفريق</h4>
                <span className="task-project">نظام إدارة المشاريع</span>
              </div>
              <span className="task-due">5 أيام</span>
              <span className="task-status status-pending">في الانتظار</span>
            </li>
          </ul>
        </section>
      </main>
    </div>
    </div>
    </div>
  );
};

export default SupervisorDashboard;