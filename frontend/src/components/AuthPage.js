import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const AuthPage = ({ login, register }) => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && (tab === 'login' || tab === 'register')) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (activeTab === 'login') {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password);
      }

      if (result.success) {
        setFormData({ name: '', email: '', password: '' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-header">
            <Link to="/" className="logo">
              <div className="logo-circle">B</div>
              <div className="logo-text">
                <span className="logo-name">BitSecure</span>
                <span className="logo-subtitle">Trading Platform</span>
              </div>
            </Link>
          </div>
          
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Iniciar Sesión
            </button>
            <button 
              className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              Registrarse
            </button>
          </div>
          
          <div className="auth-forms">
            <form 
              className={`auth-form ${activeTab === 'login' ? 'active' : ''}`}
              onSubmit={handleSubmit}
            >
              <h2>Iniciar Sesión</h2>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  name="email"
                  className="form-control" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input 
                  type="password" 
                  name="password"
                  className="form-control" 
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary btn-full-width"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>
            
            <form 
              className={`auth-form ${activeTab === 'register' ? 'active' : ''}`}
              onSubmit={handleSubmit}
            >
              <h2>Registrarse</h2>
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input 
                  type="text" 
                  name="name"
                  className="form-control" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  name="email"
                  className="form-control" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input 
                  type="password" 
                  name="password"
                  className="form-control" 
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary btn-full-width"
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>
          </div>
          
          <Link to="/" className="back-btn">
            ← Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;