import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/Auth/LoginPage';
import RegistrationForm from './pages/Auth/RegistrationForm';
import StudentProfile from './pages/StudentProfile';
import ProposalForm from './pages/ProposalForm';
import { AuthProvider } from './context/AuthContext';

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
                 path="/proposal" 
                 element={
                  <ProtectedRoute>
                    <ProposalForm />
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
  return token ? children : <Navigate to="/login" />;
};

export default App;