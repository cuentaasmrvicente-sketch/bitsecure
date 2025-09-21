import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import components
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Toast from './components/Toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      checkAuthStatus(token);
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async (token) => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password
      });
      
      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      setUser(userData);
      showToast('Inicio de sesión exitoso', 'success');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Error al iniciar sesión';
      showToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API}/auth/register`, {
        name,
        email,
        password
      });
      
      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      setUser(userData);
      showToast('Registro exitoso. ¡Bienvenido!', 'success');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Error al registrarse';
      showToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    showToast('Sesión cerrada correctamente', 'success');
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    const toast = { id, message, type };
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Header user={user} logout={logout} />
        
        <Routes>
          <Route 
            path="/" 
            element={
              user ? <Navigate to="/home" /> : <LandingPage />
            } 
          />
          <Route 
            path="/auth" 
            element={
              user ? <Navigate to="/home" /> : 
              <AuthPage login={login} register={register} />
            } 
          />
          <Route 
            path="/home" 
            element={
              user ? 
              <HomePage 
                user={user}
                getAuthHeaders={getAuthHeaders}
              /> : 
              <Navigate to="/auth" />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? 
              <Dashboard 
                user={user} 
                setUser={setUser}
                showToast={showToast}
                getAuthHeaders={getAuthHeaders}
                API={API}
              /> : 
              <Navigate to="/auth" />
            } 
          />
        </Routes>

        {/* Toast Notifications */}
        <div className="toast-container">
          {toasts.map(toast => (
            <Toast 
              key={toast.id} 
              message={toast.message} 
              type={toast.type}
              onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            />
          ))}
        </div>
      </div>
    </Router>
  );
}

export default App;