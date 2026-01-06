/**
 * Main App Component
 * Sets up routing and authentication provider
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { SidebarProvider } from './context/SidebarContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Login from './pages/Login.jsx';
import DashboardHome from './pages/DashboardHome.jsx';
import Companies from './pages/Companies.jsx';
import Vacancies from './pages/Vacancies.jsx';
import Applications from './pages/Applications.jsx';
import Materials from './pages/Materials.jsx';
import Certificates from './pages/Certificates.jsx';
import CertificateVerify from './pages/CertificateVerify.jsx';
import NotFound from './pages/NotFound.jsx';

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/certificates/verify/:qrCode" element={<CertificateVerify />} />

            {/* Protected Routes with Layout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Default dashboard route */}
              <Route index element={<DashboardHome />} />

              {/* Company routes */}
              <Route path="companies" element={<Companies />} />

              {/* Vacancy routes */}
              <Route path="vacancies" element={<Vacancies />} />

              {/* Application routes */}
              <Route path="applications" element={<Applications />} />

              {/* Material routes */}
              <Route path="materials" element={<Materials />} />

              {/* Certificate routes */}
              <Route path="certificates" element={<Certificates />} />

              {/* Other dashboard routes will go here */}
              {/* Example:
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="departments" element={<DepartmentsPage />} />
            */}
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
