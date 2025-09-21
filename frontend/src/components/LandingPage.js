import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LandingPage = () => {
  const [tradingData, setTradingData] = useState([]);
  const [activeFAQ, setActiveFAQ] = useState(null);

  useEffect(() => {
    // Load trading data
    loadTradingData();
    
    // Update trading data every 4 seconds
    const interval = setInterval(loadTradingData, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const loadTradingData = async () => {
    try {
      const response = await axios.get(`${API}/trading/data`);
      setTradingData(response.data.pairs);
    } catch (error) {
      console.error('Error loading trading data:', error);
    }
  };

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const faqData = [
    {
      question: "¿Por qué elegir BitSecure?",
      answer: "BitSecure combina tecnología de vanguardia con una interfaz intuitiva, ofreciendo acceso directo a los mercados más dinámicos con herramientas profesionales y soporte personalizado 24/7."
    },
    {
      question: "¿Cómo maximizar mis ganancias?",
      answer: "Utiliza nuestras herramientas de análisis en tiempo real, diversifica tu portafolio, aprovecha las señales de nuestros expertos y mantente informado con nuestros análisis diarios y semanales."
    },
    {
      question: "¿Por qué actuar ahora?",
      answer: "Los mercados no esperan. Cada día que pases es una oportunidad perdida. Además, cuanto antes comiences, antes podrás acceder a rangos superiores con beneficios exclusivos."
    },
    {
      question: "¿Qué soporte ofrecen?",
      answer: "Ofrecemos soporte 24/7 a través de nuestro sistema de tickets integrado, con respuesta prioritaria según tu rango. Los usuarios Gold y Platinum tienen acceso a soporte VIP y gestores personales."
    },
    {
      question: "¿Tengo control total?",
      answer: "Tienes control total. Puedes depositar y retirar cuando quieras, monitorear todas tus transacciones en tiempo real y acceder a un historial completo de todas tus operaciones."
    }
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="hero" id="inicio">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Haz crecer tu capital con gestión profesional</h1>
            <p className="hero-description">
              Únete a miles de traders que confían en nuestra plataforma para maximizar sus inversiones en criptomonedas
            </p>
            <div className="hero-buttons">
              <Link to="/auth?tab=register" className="btn btn-primary btn-lg">
                Empezar Ahora
              </Link>
              <Link to="/auth?tab=login" className="btn btn-outline btn-lg">
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trading Section */}
      <section className="trading-section" id="trading">
        <div className="container">
          <h2 className="section-title">Operaciones en Tiempo Real</h2>
          <p className="section-subtitle">Seguimiento en vivo de las operaciones más exitosas</p>
          
          <div className="trading-grid">
            {tradingData.map((pair, index) => (
              <div key={index} className="trading-card">
                <div className="trading-pair">{pair.pair}</div>
                <div className="trading-stats">
                  <div className="trading-stat">
                    <div className="trading-stat-label">Cambio</div>
                    <div className={`trading-stat-value trading-change ${pair.change >= 0 ? 'positive' : 'negative'}`}>
                      {pair.change >= 0 ? '+' : ''}{pair.change.toFixed(2)}%
                    </div>
                  </div>
                  <div className="trading-stat">
                    <div className="trading-stat-label">Dirección</div>
                    <div className="trading-stat-value">
                      <span className={`trading-direction ${pair.direction.toLowerCase()}`}>
                        {pair.direction}
                      </span>
                    </div>
                  </div>
                  <div className="trading-stat">
                    <div className="trading-stat-label">Apalancamiento</div>
                    <div className="trading-stat-value">
                      <span className="trading-leverage">{pair.leverage}</span>
                    </div>
                  </div>
                  <div className="trading-stat">
                    <div className="trading-stat-label">Valor</div>
                    <div className="trading-stat-value trading-value">
                      €{pair.value.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Todo lo que necesitas para triunfar</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3 className="feature-title">Trading en Vivo</h3>
              <p className="feature-description">Copia automática de operaciones profesionales 24/7</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3 className="feature-title">Análisis Avanzado</h3>
              <p className="feature-description">Métricas en tiempo real y herramientas de análisis técnico</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3 className="feature-title">Sistema de Rangos</h3>
              <p className="feature-description">Sube de nivel y desbloquea beneficios exclusivos</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3 className="feature-title">Soporte Integrado</h3>
              <p className="feature-description">Sistema de tickets y chat directo con expertos</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section" id="soporte">
        <div className="container">
          <h2 className="section-title">Preguntas Frecuentes</h2>
          
          <div className="faq-grid">
            {faqData.map((item, index) => (
              <div key={index} className={`faq-item ${activeFAQ === index ? 'active' : ''}`}>
                <button 
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                >
                  <span>{item.question}</span>
                  <span className="faq-icon">+</span>
                </button>
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-features">
            <div className="footer-feature">
              <div className="footer-feature-icon">🔒</div>
              <h4>Seguridad Avanzada</h4>
              <p>Protección de última generación con autentificación multi-factor y encriptación bancaria.</p>
            </div>
            
            <div className="footer-feature">
              <div className="footer-feature-icon">⚡</div>
              <h4>Retiros Rápidos</h4>
              <p>Procesa tus retiros de forma eficiente con tiempos de respuesta optimizados.</p>
            </div>
            
            <div className="footer-feature">
              <div className="footer-feature-icon">🕒</div>
              <h4>Soporte 24/7</h4>
              <p>Equipo de expertos disponible las 24 horas para resolver cualquier consulta.</p>
            </div>
            
            <div className="footer-feature">
              <div className="footer-feature-icon">🚀</div>
              <h4>Tecnología Cutting-Edge</h4>
              <p>Plataforma construida con las últimas tecnologías para máximo rendimiento.</p>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 BitSecure Trading Platform. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;