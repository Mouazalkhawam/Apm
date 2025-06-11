import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/Auth/LoginPage';
import RegistrationForm from './pages/Auth/RegistrationForm';
import StudentProfile from './pages/StudentProfile';
import ProposalForm from './pages/ProposalForm';
import NewProjectForm from './pages/NewProjectForm';
import AcademicDashboard from './pages/AcademicDashboard';
import HonorBoard from './pages/HonorBoard';
import StudentEvaluation from './pages/StudentEvaluation';
import ResourcesLibrary from './pages/ResourcesLibrary'; 
import StudentProjectManagement  from './pages/StudentProjectManagement'; 
import GroupProjectManagement  from './pages/GroupProjectManagement';
import SupervisorsManagement from './pages/SupervisorsManagement';
import TeamMembers from './pages/TeamMembers';
import SchedulingStudentMeetings from './pages/SchedulingStudentMeetings';

import { AuthProvider } from './context/AuthContext';
import DiscussionsStudent from './pages/DiscussionsStudent';
import SchedulingSupervisorsMeetings from './pages/SchedulingSupervisorsMeetings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <StudentProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
               path="/new-project" 
               element={
                <ProtectedRoute>
                <NewProjectForm />
                </ProtectedRoute>
                       } 
             />
               <Route 
                 path="/proposal" 
                 element={
                  <ProtectedRoute>
                    <ProposalForm />
                            </ProtectedRoute>
                          } 
               />
               <Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <AcademicDashboard />
    </ProtectedRoute>
  } 
/>
<Route 
                 path="/honorboard" 
                 element={
                  <ProtectedRoute>
                    <HonorBoard />
                            </ProtectedRoute>
                          } 
               />
               <Route 
                 path="/student-evaluation" 
                 element={
                  <ProtectedRoute>
                    <StudentEvaluation />
                            </ProtectedRoute>
                          } 
               />
                 <Route 
                 path="/Resources-Library" 
                 element={
                  <ProtectedRoute>
                    <ResourcesLibrary />
                            </ProtectedRoute>
                          } 
               />
              <Route 
                 path="/student-project-management" 
                 element={
                  <ProtectedRoute>
                    <StudentProjectManagement />
                            </ProtectedRoute>
                          } 
               />
               <Route 
                 path="/group-project-management" 
                 element={
                  <ProtectedRoute>
                    <GroupProjectManagement />
                            </ProtectedRoute>
                          } 
               />
               <Route 
                 path="/supervisors-management" 
                 element={
                  <ProtectedRoute>
                    <SupervisorsManagement />
                            </ProtectedRoute>
                          } 
               />
                <Route 
                 path="/team-members" 
                 element={
                  <ProtectedRoute>
                    <TeamMembers />
                            </ProtectedRoute>
                          } 
               />
               <Route 
                 path="/scheduling-student-meetings" 
                 element={
                  <ProtectedRoute>
                    <SchedulingStudentMeetings />
                            </ProtectedRoute>
                          } 
               />
                <Route 
                 path="/discussion-student" 
                 element={
                  <ProtectedRoute>
                    <DiscussionsStudent />
                            </ProtectedRoute>
                          } 
               />
               <Route 
                 path="/scheduling-supervisors-meetings" 
                 element={
                  <ProtectedRoute>
                    <SchedulingSupervisorsMeetings />
                            </ProtectedRoute>
                          } 
               />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
    
        </div>
      </AuthProvider>
    </Router>
  );
}

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default App;