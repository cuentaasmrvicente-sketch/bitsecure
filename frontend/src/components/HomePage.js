import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  RocketIcon, 
  MoneyIcon, 
  BankNotesIcon, 
  NewsIcon, 
  BoltIcon, 
  SearchIcon, 
  ChartBarIcon, 
  TrendUpIcon, 
  TrendDownIcon, 
  CheckCircleIcon, 
  ClockIcon,
  DashboardIcon,
  CogIcon
} from './Icons';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = ({ user, getAuthHeaders }) => {
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [cryptoNews, setCryptoNews] = useState([]);
  const [tradingData, setTradingData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadTradingData, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [pricesResponse, newsResponse, tradingResponse] = await Promise.all([
        axios.get(`${API}/crypto/prices`),
        axios.get(`${API}/crypto/news`),
        axios.get(`${API}/trading/data`)
      ]);

      setCryptoPrices(pricesResponse.data);
      setCryptoNews(newsResponse.data);
      setTradingData(tradingResponse.data.pairs);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTradingData = async () => {
    try {
      const response = await axios.get(`${API}/trading/data`);
      setTradingData(response.data.pairs);
    } catch (error) {
      console.error('Error loading trading data:', error);
    }
  };

  const formatPrice = (price) => {
    if (price >= 1000) {
      return `$${price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(4)}`;
  };

  const formatBalance = (balance) => {
    return `€${balance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Cargando datos del mercado...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-card">
            <div className="welcome-content">
              <h1>¡Bienvenido, {user.name}! <RocketIcon size="lg" /></h1>
              <p>Tu centro de comando para trading de criptomonedas</p>
            </div>
            <div className="welcome-actions">
              <div className="balance-display">
                <div className="balance-label">Balance Total</div>
                <div className="balance-amount">{formatBalance(user.balance)}</div>
                <div className="balance-actions">
                  <Link to="/dashboard?tab=deposits" className="btn btn-primary btn-sm">
                    <MoneyIcon size="sm" /> Depositar
                  </Link>
                  <Link to="/dashboard?tab=withdrawals" className="btn btn-outline btn-sm">
                    <BankNotesIcon size="sm" /> Retirar
                  </Link>
                </div>
              </div>
              <div className="control-panel-access">
                <Link to="/dashboard" className="btn btn-control-panel">
                  <div className="control-panel-icon"><CogIcon size="3xl" /></div>
                  <div className="control-panel-text">
                    <div className="control-panel-title">Panel de Control</div>
                    <div className="control-panel-subtitle">Acceso completo</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Crypto Prices Section */}
        <div className="crypto-prices-section">
          <h2 className="section-title">
            <SearchIcon size="lg" />
            Precios en Tiempo Real
          </h2>
          <div className="crypto-grid">
            {Object.entries(cryptoPrices).map(([symbol, data]) => (
              <div key={symbol} className="crypto-card">
                <div className="crypto-header">
                  <div className="crypto-symbol">{data.symbol}</div>
                  <div className="crypto-name">{symbol}</div>
                </div>
                <div className="crypto-price">{formatPrice(data.price)}</div>
                <div className={`crypto-change ${data.change_24h >= 0 ? 'positive' : 'negative'}`}>
                  {data.change_24h >= 0 ? <TrendUpIcon size="sm" /> : <TrendDownIcon size="sm" />} {data.change_24h >= 0 ? '+' : ''}{data.change_24h.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trading Section */}
        <div className="trading-live-section">
          <h2 className="section-title">
            <BoltIcon size="lg" />
            Trading en Vivo
          </h2>
          <div className="trading-grid">
            {tradingData.map((pair, index) => (
              <div key={index} className="trading-card">
                <div className="trading-header">
                  <div className="trading-pair">{pair.pair}</div>
                  <div className="trading-status"><CheckCircleIcon size="xs" /> ACTIVO</div>
                </div>
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
                        {pair.direction === 'LONG' ? <TrendUpIcon size="xs" /> : <TrendDownIcon size="xs" />} {pair.direction}
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

        {/* News Section */}
        <div className="news-section">
          <h2 className="section-title">
            <NewsIcon size="lg" />
            Últimas Noticias Crypto
          </h2>
          <div className="news-grid">
            {cryptoNews.map((article) => (
              <div key={article.id} className="news-card">
                <div className="news-header">
                  <h3 className="news-title">{article.title}</h3>
                  <div className="news-source">{article.source}</div>
                </div>
                <p className="news-summary">{article.summary}</p>
                <div className="news-date">
                  <ClockIcon size="xs" /> {new Date(article.date).toLocaleDateString('es-ES')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h2 className="section-title">
            <BoltIcon size="lg" />
            Acciones Rápidas
          </h2>
          <div className="quick-actions-grid">
            <Link to="/dashboard?tab=deposits" className="action-card">
              <div className="action-icon"><MoneyIcon size="3xl" /></div>
              <h3>Realizar Depósito</h3>
              <p>Añade fondos a tu cuenta de forma segura</p>
            </Link>
            <Link to="/dashboard?tab=withdrawals" className="action-card">
              <div className="action-icon"><BankNotesIcon size="3xl" /></div>
              <h3>Solicitar Retiro</h3>
              <p>Retira tus ganancias cuando quieras</p>
            </Link>
            <Link to="/dashboard?tab=history" className="action-card">
              <div className="action-icon"><ClockIcon size="3xl" /></div>
              <h3>Ver Historial</h3>
              <p>Revisa todas tus transacciones</p>
            </Link>
            <Link to="/dashboard?tab=overview" className="action-card">
              <div className="action-icon"><ChartBarIcon size="3xl" /></div>
              <h3>Trading Avanzado</h3>
              <p>Accede al panel completo de trading</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;