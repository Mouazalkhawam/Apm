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
import './ReportCoordinator.css';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav';

const ReportCoordinator = () => {
  // Sidebar and user states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    image: '',
    role: ''
  });
  const [reportData, setReportData] = useState({
    coordinator_name: 'أحمد محمد',
    report_date: new Date().toISOString(),
    total_evaluations_received: 48,
    overall_average_rating: 4.7,
    overall_satisfaction_percentage: 94,
    criteria_details: [
      { name: 'إدارة الجدول الزمني', rating: 4.8, percentage: 96 },
      { name: 'توفير الموارد', rating: 4.5, percentage: 90 },
      { name: 'جودة التواصل', rating: 4.9, percentage: 98 },
      { name: 'حل المشكلات', rating: 4.3, percentage: 86 },
      { name: 'التقيد بالمواعيد', rating: 4.7, percentage: 94 }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sidebar functions
  const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);
  const closeMobileSidebar = () => setMobileSidebarOpen(false);
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  useEffect(() => {
    // Set current date
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('report-date').textContent = today.toLocaleDateString('ar-EG', options);
    
    // Animate percentage bar
    const percentageBar = document.getElementById('percentage-bar');
    setTimeout(() => {
      percentageBar.style.width = `${reportData.overall_satisfaction_percentage}%`;
    }, 300);
    
    // Dynamic rating color based on score
    const ratingScore = reportData.overall_average_rating;
    const ratingCircle = document.querySelector('.rating-circle');
    
    if (ratingScore >= 4.5) {
      ratingCircle.style.backgroundColor = '#27ae60';
    } else if (ratingScore >= 3.5) {
      ratingCircle.style.backgroundColor = '#f39c12';
    } else {
      ratingCircle.style.backgroundColor = '#e74c3c';
    }

    // Fetch user data
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

    // Fetch report data
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://127.0.0.1:8000/api/evaluations/coordinator-report', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.data.success) {
          const apiData = response.data.report;
          // Transform API data to match our structure
          const transformedData = {
            coordinator_name: apiData.coordinator_name,
            report_date: apiData.report_date,
            total_evaluations_received: apiData.total_evaluations_received,
            overall_average_rating: apiData.overall_average_rating,
            overall_satisfaction_percentage: apiData.overall_satisfaction_percentage,
            criteria_details: apiData.criteria_details.map(criteria => ({
              name: criteria.criteria_title,
              rating: criteria.average_rating,
              percentage: criteria.satisfaction_percentage
            }))
          };
          setReportData(transformedData);
        }
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('حدث خطأ أثناء جلب بيانات التقرير');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchReportData();
  }, []);

  const getRatingText = (score) => {
    if (score >= 4.5) return 'ممتاز';
    if (score >= 3.5) return 'جيد جداً';
    if (score >= 2.5) return 'جيد';
    return 'يحتاج تحسين';
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <>
        {'★'.repeat(fullStars)}
        {hasHalfStar && '☆'}
        {'☆'.repeat(emptyStars)}
      </>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-container-dash-sup">
        <div className="main-container">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '18px',
            color: '#2c3e50'
          }}>
            جاري تحميل البيانات...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container-dash-sup">
        <div className="main-container">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '18px',
            color: '#e74c3c'
          }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

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
                <div className="container" dir="rtl">
                  {/* Header Section */}
                  <div className="header">
                    <h1>تقرير التقييمات</h1>
                    <div className="header-info">
                      <div className="header-info-item">
                        <span>اسم المنسق</span>
                        <strong>{reportData.coordinator_name}</strong>
                      </div>
                      <div className="header-info-item">
                        <span>تاريخ التقرير</span>
                        <strong id="report-date"></strong>
                      </div>
                      <div className="header-info-item">
                        <span>عدد التقييمات</span>
                        <strong>{reportData.total_evaluations_received} تقييم</strong>
                      </div>
                    </div>
                  </div>
                  
                  {/* Rating Summary Section */}
                  <div className="rating-summary">
                    <h2>الرضا العام</h2>
                    <div className="overall-rating">
                      <div className="rating-circle">
                        <div className="rating-score">{reportData.overall_average_rating}</div>
                        <div className="rating-label">من 5.0</div>
                      </div>
                      <div className="rating-details">
                        <div className="rating-text">{getRatingText(reportData.overall_average_rating)}</div>
                        <div className="rating-percentage">
                          <div className="percentage-bar" id="percentage-bar"></div>
                        </div>
                        <div className="rating-legend">
                          <span>0%</span>
                          <span>رضا عام {reportData.overall_satisfaction_percentage}%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Criteria Ratings Section */}
                  <div className="criteria-ratings">
                    <h2>تفاصيل التقييم حسب المعايير</h2>
                    <ul className="criteria-list">
                      {reportData.criteria_details.map((item, index) => (
                        <li key={index} className="criteria-item">
                          <div className="criteria-name">{item.name}</div>
                          <div className="criteria-rating">
                            <span className="stars">{renderStars(item.rating)}</span>
                            <span>{item.rating}</span>
                          </div>
                          <div className="criteria-percentage">{item.percentage}% رضا</div>
                        </li>
                      ))}
                    </ul>
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

export default ReportCoordinator;