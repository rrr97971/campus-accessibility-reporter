import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import ReportIssue from './pages/ReportIssue';
import MyReports from './pages/MyReports';
import IssueDetails from './pages/IssueDetails';
import EditIssue from './pages/EditIssue';
import AdminDashboard from './pages/AdminDashboard';
import AllIssues from './pages/AllIssues';
import AdminIssueDetails from './pages/AdminIssueDetails';
import Profile from './pages/Profile';

function Shell() {
  const { user } = useAuth();
  return (
    <>
      <Navbar user={user} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute allowedRoles={['student']}><ReportIssue /></ProtectedRoute>} />
        <Route path="/my-reports" element={<ProtectedRoute allowedRoles={['student']}><MyReports /></ProtectedRoute>} />
        <Route path="/issues/:id" element={<ProtectedRoute><IssueDetails /></ProtectedRoute>} />
        <Route path="/issues/:id/edit" element={<ProtectedRoute allowedRoles={['student']}><EditIssue /></ProtectedRoute>} />

        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/issues" element={<ProtectedRoute allowedRoles={['admin']}><AllIssues /></ProtectedRoute>} />
        <Route path="/admin/issues/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminIssueDetails /></ProtectedRoute>} />

        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
