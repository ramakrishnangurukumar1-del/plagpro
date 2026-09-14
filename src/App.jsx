import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { facultyUser } from './mock/data';

export default function App() {
  const [role, setRole] = useState('Student');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login onLogin={setRole} />} />
        <Route path="/register" element={<Register />} />

        <Route path="/app/home" element={<StudentHome />} />
        <Route path="/app/upload" element={<Upload />} />
        <Route path="/app/processing/:id" element={<Processing />} />
        <Route path="/app/results/:id" element={<Results />} />
        <Route path="/app/documents" element={<MyDocuments />} />
        <Route path="/app/document/:id" element={<DocumentAnalysis />} />
        <Route path="/app/report/:id" element={<ReportPreview />} />
        <Route path="/app/profile" element={<Profile />} />
        <Route path="/app/reports" element={<Reports />} />

        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/submissions" element={<Submissions />} />
        <Route path="/faculty/reports" element={<Reports role="Faculty" user={facultyUser} />} />
        <Route path="/faculty/users" element={<ManageUsers />} />
        <Route path="/faculty/settings" element={<FacultySettings />} />
        <Route path="/faculty/profile" element={<Profile role="Faculty" user={facultyUser} />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
