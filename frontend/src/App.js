import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PDFDetails from './pages/PDFDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminCreatePDF from './pages/AdminCreatePDF';
import AdminEditPDF from './pages/AdminEditPDF';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pdf/:id" element={<PDFDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/google/callback" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/pdf/create"
            element={
              <AdminRoute>
                <AdminCreatePDF />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/pdf/edit/:id"
            element={
              <AdminRoute>
                <AdminEditPDF />
              </AdminRoute>
            }
          />
          <Route
            path="/checkout/success"
            element={
              <PrivateRoute>
                <CheckoutSuccess />
              </PrivateRoute>
            }
          />
          <Route path="/checkout/cancel" element={<CheckoutCancel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

