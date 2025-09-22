import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ChartBarIcon, 
  SearchIcon, 
  TrophyIcon, 
  ChatIcon, 
  LockIcon, 
  BoltIcon, 
  ClockIcon, 
  RocketIcon, 
  ShieldIcon, 
  BankNotesIcon, 
  SupportIcon, 
  TechIcon 
} from './Icons';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LandingPage = () => {
  const [tradingData, setTradingData] = useState([]);
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [supportForm, setSupportForm] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [submitStatus, setSubmitStatus] = useState('');

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

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    
    if (!supportForm.subject.trim() || !supportForm.message.trim()) {
      setSubmitStatus('Por favor completa todos los campos');
      return;
    }

    try {
      setSubmitStatus('Enviando...');
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        setSubmitStatus('Debes iniciar sesión para enviar un ticket de soporte');
        return;
      }

      const response = await axios.post(`${API}/support/tickets`, supportForm, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        setSupportForm({ subject: '', message: '', priority: 'medium' });
        setSubmitStatus('¡Ticket enviado exitosamente! Te contactaremos pronto.');
      }
    } catch (error) {
      console.error('Error sending support ticket:', error);
      if (error.response?.status === 401) {
        setSubmitStatus('Debes iniciar sesión para enviar un ticket de soporte');
      } else {
        setSubmitStatus('Error al enviar el ticket. Por favor intenta de nuevo.');
      }
    }
  };

  const handleSupportInputChange = (e) => {
    const { name, value } = e.target;
    setSupportForm(prev => ({
      ...prev,
      [name]: value
    }));
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
              <Link to="/auth?tab=register" className="btn bg-green-500 hover:bg-green-600 text-white border-green-500 btn-lg">
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
              <div className="feature-icon"><ChartBarIcon size="3xl" /></div>
              <h3 className="feature-title">Trading en Vivo</h3>
              <p className="feature-description">Copia automática de operaciones profesionales 24/7</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon"><SearchIcon size="3xl" /></div>
              <h3 className="feature-title">Análisis Avanzado</h3>
              <p className="feature-description">Métricas en tiempo real y herramientas de análisis técnico</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon"><TrophyIcon size="3xl" /></div>
              <h3 className="feature-title">Sistema de Rangos</h3>
              <p className="feature-description">Sube de nivel y desbloquea beneficios exclusivos</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon"><ChatIcon size="3xl" /></div>
              <h3 className="feature-title">Soporte Integrado</h3>
              <p className="feature-description">Sistema de tickets y chat directo con expertos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Section - How Brokers Work */}
      <section className="education-section">
        <div className="container">
          <h2 className="section-title">¿Cómo Funciona un Broker y Por Qué Es Seguro?</h2>
          <p className="section-subtitle">
            Comprende los fundamentos del trading profesional y la seguridad que ofrecemos
          </p>
          
          <div className="education-grid">
            {/* How Brokers Work */}
            <div className="education-card">
              <div className="education-image">
                <img 
                  src="https://images.unsplash.com/photo-1716279083176-60af7a63cb03?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwyfHx0cmFkaW5nJTIwYnJva2VyfGVufDB8fHx8MTc1ODUzNzQyNnww&ixlib=rb-4.1.0&q=85"
                  alt="Análisis profesional de trading"
                  className="hover-zoom"
                />
              </div>
              <div className="education-content">
                <h3>¿Qué Hace un Broker?</h3>
                <p>
                  Un broker actúa como intermediario entre tú y los mercados financieros. Nosotros 
                  ejecutamos tus órdenes de compra y venta, proporcionamos análisis en tiempo real, 
                  y te damos acceso a herramientas profesionales que normalmente solo están disponibles 
                  para traders institucionales.
                </p>
                <ul className="education-benefits">
                  <li><CheckCircleIcon size="sm" /> Acceso directo a mercados globales</li>
                  <li><CheckCircleIcon size="sm" /> Herramientas de análisis profesional</li>
                  <li><CheckCircleIcon size="sm" /> Ejecución instantánea de órdenes</li>
                </ul>
              </div>
            </div>

            {/* Mobile Trading */}
            <div className="education-card reverse">
              <div className="education-image">
                <img 
                  src="https://images.unsplash.com/photo-1716279083223-006db39251e1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwzfHx0cmFkaW5nJTIwYnJva2VyfGVufDB8fHx8MTc1ODUzNzQyNnww&ixlib=rb-4.1.0&q=85"
                  alt="Trading móvil accesible"
                  className="hover-zoom"
                />
              </div>
              <div className="education-content">
                <h3>Trading Desde Cualquier Lugar</h3>
                <p>
                  Nuestra plataforma está diseñada para que puedas operar desde cualquier dispositivo. 
                  Con tecnología de vanguardia, garantizamos que tengas acceso completo a tu cuenta, 
                  análisis en tiempo real y capacidad de trading las 24 horas del día, 7 días a la semana.
                </p>
                <ul className="education-benefits">
                  <li><SmartphoneIcon size="sm" /> Aplicación móvil intuitiva</li>
                  <li><ClockIcon size="sm" /> Trading 24/7 disponible</li>
                  <li><BoltIcon size="sm" /> Notificaciones en tiempo real</li>
                </ul>
              </div>
            </div>

            {/* Financial Security */}
            <div className="education-card">
              <div className="education-image">
                <img 
                  src="https://images.unsplash.com/photo-1553729459-efe14ef6055d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHxmaW5hbmNpYWwlMjBzZWN1cml0eXxlbnwwfHx8fDE3NTg1Mzc0MzF8MA&ixlib=rb-4.1.0&q=85"
                  alt="Transacciones seguras"
                  className="hover-zoom"
                />
              </div>
              <div className="education-content">
                <h3>Seguridad en Cada Transacción</h3>
                <p>
                  Implementamos múltiples capas de seguridad para proteger tus fondos y datos personales. 
                  Desde encriptación de nivel bancario hasta auditorías regulares, tu dinero está 
                  completamente protegido con nosotros.
                </p>
                <ul className="education-benefits">
                  <li><ShieldIcon size="sm" /> Encriptación SSL de 256 bits</li>
                  <li><LockIcon size="sm" /> Autenticación de dos factores</li>
                  <li><BuildingIcon size="sm" /> Fondos segregados en bancos tier-1</li>
                </ul>
              </div>
            </div>

            {/* Asset Protection */}
            <div className="education-card reverse">
              <div className="education-image">
                <img 
                  src="https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg"
                  alt="Protección de activos"
                  className="hover-zoom"
                />
              </div>
              <div className="education-content">
                <h3>Protección Total de Activos</h3>
                <p>
                  Tus fondos están protegidos por un esquema de compensación de inversores y mantenidos 
                  en cuentas segregadas. Esto significa que tu dinero está completamente separado de 
                  los fondos operativos de la empresa, garantizando su seguridad absoluta.
                </p>
                <ul className="education-benefits">
                  <li><BankNotesIcon size="sm" /> Cuentas segregadas</li>
                  <li><TrophyIcon size="sm" /> Regulación financiera estricta</li>
                  <li><CheckCircleIcon size="sm" /> Compensación de hasta €85,000</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="education-cta">
            <h3>¿Listo para empezar con total seguridad?</h3>
            <p>Únete a miles de traders que confían en BitSecure para hacer crecer su capital</p>
            <Link to="/auth?tab=register" className="btn bg-green-500 hover:bg-green-600 text-white border-green-500 btn-lg">
              <RocketIcon size="sm" /> Comenzar Ahora - Es Gratis
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section" id="soporte">
        <div className="container">
          <h2 className="section-title">Soporte y Preguntas Frecuentes</h2>
          
          {/* Support Contact Form */}
          <div className="support-contact-section">
            <div className="support-form-card">
              <h3 className="support-form-title">¿Necesitas ayuda personalizada?</h3>
              <p className="support-form-description">
                Nuestro equipo de expertos está aquí para ayudarte. Envíanos tu consulta y te responderemos lo antes posible.
              </p>
              
              <form onSubmit={handleSupportSubmit} className="support-form">
                <div className="form-group">
                  <label className="form-label">Asunto</label>
                  <input
                    type="text"
                    name="subject"
                    value={supportForm.subject}
                    onChange={handleSupportInputChange}
                    className="form-input"
                    placeholder="Describe brevemente tu consulta..."
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Prioridad</label>
                  <select
                    name="priority"
                    value={supportForm.priority}
                    onChange={handleSupportInputChange}
                    className="form-select"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Mensaje</label>
                  <textarea
                    name="message"
                    value={supportForm.message}
                    onChange={handleSupportInputChange}
                    className="form-textarea"
                    rows="4"
                    placeholder="Describe detalladamente tu consulta o problema..."
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className="btn bg-green-500 hover:bg-green-600 text-white border-green-500 btn-lg">
                  <SupportIcon size="sm" /> Enviar Consulta
                </button>
                
                {submitStatus && (
                  <div className={`support-status ${submitStatus.includes('exitosamente') ? 'success' : 'error'}`}>
                    {submitStatus}
                  </div>
                )}
              </form>
            </div>
          </div>
          
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
              <div className="footer-feature-icon"><LockIcon size="3xl" /></div>
              <h4>Seguridad Avanzada</h4>
              <p>Protección de última generación con autentificación multi-factor y encriptación bancaria.</p>
            </div>
            
            <div className="footer-feature">
              <div className="footer-feature-icon"><BoltIcon size="3xl" /></div>
              <h4>Retiros Rápidos</h4>
              <p>Procesa tus retiros de forma eficiente con tiempos de respuesta optimizados.</p>
            </div>
            
            <div className="footer-feature">
              <div className="footer-feature-icon"><ClockIcon size="3xl" /></div>
              <h4>Soporte 24/7</h4>
              <p>Equipo de expertos disponible las 24 horas para resolver cualquier consulta.</p>
            </div>
            
            <div className="footer-feature">
              <div className="footer-feature-icon"><RocketIcon size="3xl" /></div>
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