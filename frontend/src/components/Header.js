import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ user, logout }) => {
  const location = useLocation();

  const handleNavClick = (section) => {
    if (location.pathname === '/') {
      // On landing page, scroll to section
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <div className="logo-circle">B</div>
            <div className="logo-text">
              <span className="logo-name">BitSecure</span>
              <span className="logo-subtitle">Trading Platform</span>
            </div>
          </Link>
          
          {location.pathname === '/' && (
            <nav className="nav">
              <button 
                className="nav-link" 
                onClick={() => handleNavClick('inicio')}
                style={{background: 'none', border: 'none', cursor: 'pointer'}}
              >
                Inicio
              </button>
              <button 
                className="nav-link" 
                onClick={() => handleNavClick('trading')}
                style={{background: 'none', border: 'none', cursor: 'pointer'}}
              >
                Trading
              </button>
              <Link to={user ? "/dashboard?tab=deposits" : "/auth"} className="nav-link">
                Depósitos
              </Link>
              <Link to={user ? "/dashboard?tab=withdrawals" : "/auth"} className="nav-link">
                Retiros
              </Link>
              <button 
                className="nav-link" 
                onClick={() => handleNavClick('soporte')}
                style={{background: 'none', border: 'none', cursor: 'pointer'}}
              >
                Soporte
              </button>
            </nav>
          )}

          <div className="auth-buttons">
            {user ? (
              <div className="user-menu">
                <span className="user-name">{user.name}</span>
                <button className="btn btn-outline" onClick={logout}>
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <>
                <Link to="/auth?tab=login" className="btn btn-outline">
                  Iniciar Sesión
                </Link>
                <Link to="/auth?tab=register" className="btn btn-primary">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;