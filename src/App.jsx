import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentHome from './pages/StudentHome';
import Upload from './pages/Upload';
import Processing from './pages/Processing';
import Results from './pages/Results';
import MyDocuments from './pages/MyDocuments';
import DocumentAnalysis from './pages/DocumentAnalysis';
import ReportPreview from './pages/ReportPreview';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import FacultyDashboard from './pages/FacultyDashboard';
import { Submissions, ManageUsers, FacultySettings } from './pages/FacultySimple';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/app/home" element={<ProtectedRoute role="STUDENT"><StudentHome /></ProtectedRoute>} />
          <Route path="/app/upload" element={<ProtectedRoute role="STUDENT"><Upload /></ProtectedRoute>} />
          <Route path="/app/processing/:id" element={<ProtectedRoute role="STUDENT"><Processing /></ProtectedRoute>} />
          <Route path="/app/results/:id" element={<ProtectedRoute role="STUDENT"><Results /></ProtectedRoute>} />
          <Route path="/app/documents" element={<ProtectedRoute role="STUDENT"><MyDocuments /></ProtectedRoute>} />
          <Route path="/app/document/:id" element={<ProtectedRoute><DocumentAnalysis /></ProtectedRoute>} />
          <Route path="/app/report/:id" element={<ProtectedRoute><ReportPreview /></ProtectedRoute>} />
          <Route path="/app/profile" element={<ProtectedRoute role="STUDENT"><Profile /></ProtectedRoute>} />
          <Route path="/app/reports" element={<ProtectedRoute role="STUDENT"><Reports /></ProtectedRoute>} />

          <Route path="/faculty/dashboard" element={<ProtectedRoute role="FACULTY"><FacultyDashboard /></ProtectedRoute>} />
          <Route path="/faculty/submissions" element={<ProtectedRoute role="FACULTY"><Submissions /></ProtectedRoute>} />
          <Route path="/faculty/reports" element={<ProtectedRoute role="FACULTY"><Reports /></ProtectedRoute>} />
          <Route path="/faculty/users" element={<ProtectedRoute role="FACULTY"><ManageUsers /></ProtectedRoute>} />
          <Route path="/faculty/settings" element={<ProtectedRoute role="FACULTY"><FacultySettings /></ProtectedRoute>} />
          <Route path="/faculty/profile" element={<ProtectedRoute role="FACULTY"><Profile /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
