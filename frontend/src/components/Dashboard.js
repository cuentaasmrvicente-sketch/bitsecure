import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  HomeIcon, 
  ChartBarIcon, 
  WalletIcon, 
  BankNotesIcon, 
  ClockIcon, 
  CogIcon, 
  ShieldIcon, 
  CheckCircleIcon, 
  BoltIcon,
  UsersIcon,
  BellIcon,
  ChatBubbleIcon,
  TicketIcon,
  TrendUpIcon,
  TrendDownIcon,
  DocumentTextIcon,
  RocketIcon,
  GemIcon,
  MoneyIcon,
  StarIcon,
  LockIcon,
  NewsIcon,
  BuildingIcon,
  SmartphoneIcon,
  TargetIcon,
  InfoIcon,
  CopyIcon,
  CreditCardIcon,
  SearchIcon,
  TrophyIcon,
  ChatIcon
} from './Icons';

const Dashboard = ({ user, setUser, showToast, getAuthHeaders, API }) => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [tradingData, setTradingData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationsExpanded, setNotificationsExpanded] = useState(false);
  const [adminStats, setAdminStats] = useState({ total_users: 0, total_balance: 0 });
  const [allUsers, setAllUsers] = useState([]);
  const [walletAddresses, setWalletAddresses] = useState({});
  const [loading, setLoading] = useState(false);
  const [showVoucherInfo, setShowVoucherInfo] = useState(false);
  const [messageForm, setMessageForm] = useState({
    to_user_id: '',
    subject: '',
    content: ''
  });

  // Form states (updated)
  const [depositForm, setDepositForm] = useState({
    crypto: '',
    amount: ''
  });
  const [voucherForm, setVoucherForm] = useState({
    voucher_code: '',
    amount: ''
  });
  const [withdrawalForm, setWithdrawalForm] = useState({
    method: '',
    amount: '',
    email: '',
    iban: '',
    bank_name: '',
    phone: ''
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'deposits', 'withdrawals', 'history', 'admin'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    loadInitialData();
    const tradingInterval = setInterval(loadTradingData, 4000);
    return () => clearInterval(tradingInterval);
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      loadTransactions();
    } else if (activeTab === 'admin' && user.is_admin) {
      loadAdminData();
    }
  }, [activeTab, user.is_admin]);

  const loadInitialData = async () => {
    await Promise.all([
      loadTradingData(),
      loadWalletAddresses(),
      loadCurrentUser()
    ]);
  };

  const loadCurrentUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: getAuthHeaders()
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error loading user:', error);
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

  const loadWalletAddresses = async () => {
    try {
      const response = await axios.get(`${API}/wallet-addresses`);
      setWalletAddresses(response.data);
    } catch (error) {
      console.error('Error loading wallet addresses:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await axios.get(`${API}/transactions`, {
        headers: getAuthHeaders()
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadAdminData = async () => {
    try {
      const [statsResponse, usersResponse, notificationsResponse, allTransactionsResponse] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers: getAuthHeaders() }),
        axios.get(`${API}/admin/users`, { headers: getAuthHeaders() }),
        axios.get(`${API}/admin/notifications`, { headers: getAuthHeaders() }),
        axios.get(`${API}/admin/transactions`, { headers: getAuthHeaders() })
      ]);

      setAdminStats(statsResponse.data);
      setAllUsers(usersResponse.data);
      setNotifications(notificationsResponse.data);
      setAllTransactions(allTransactionsResponse.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const handleCryptoDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/deposits/crypto`, {
        crypto: depositForm.crypto,
        amount: parseFloat(depositForm.amount)
      }, {
        headers: getAuthHeaders()
      });

      showToast(`Solicitud enviada al administrador. Envía tus fondos a: ${response.data.admin_wallet}`, 'success');
      setDepositForm({ crypto: '', amount: '' });
      if (activeTab === 'history') {
        await loadTransactions();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Error al procesar depósito';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVoucherDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/deposits/voucher`, {
        voucher_code: voucherForm.voucher_code,
        amount: parseFloat(voucherForm.amount)
      }, {
        headers: getAuthHeaders()
      });

      showToast(response.data.message, 'success');
      setVoucherForm({ voucher_code: '', amount: '' });
      if (activeTab === 'history') {
        await loadTransactions();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Error al canjear voucher';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const details = {};
      if (withdrawalForm.method === 'paypal') {
        details.email = withdrawalForm.email;
      } else if (withdrawalForm.method === 'bank') {
        details.iban = withdrawalForm.iban;
        details.bank_name = withdrawalForm.bank_name;
      } else if (withdrawalForm.method === 'bizum') {
        details.phone = withdrawalForm.phone;
      }

      await axios.post(`${API}/withdrawals`, {
        method: withdrawalForm.method,
        amount: parseFloat(withdrawalForm.amount),
        details
      }, {
        headers: getAuthHeaders()
      });

      showToast('Retiro solicitado exitosamente', 'success');
      setWithdrawalForm({
        method: '',
        amount: '',
        email: '',
        iban: '',
        bank_name: '',
        phone: ''
      });
      await loadCurrentUser();
      if (activeTab === 'history') {
        await loadTransactions();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Error al procesar retiro';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateUserBalance = async (userId, newBalance) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/balance?new_balance=${newBalance}`, {}, {
        headers: getAuthHeaders()
      });

      showToast('Balance actualizado exitosamente', 'success');
      await loadAdminData();
      if (userId === user.id) {
        await loadCurrentUser();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Error al actualizar balance';
      showToast(errorMessage, 'error');
    }
  };

  const approveTransaction = async (transactionId) => {
    try {
      await axios.put(`${API}/admin/transactions/${transactionId}/approve`, {}, {
        headers: getAuthHeaders()
      });

      showToast('Transacción aprobada exitosamente', 'success');
      await loadAdminData();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Error al aprobar transacción';
      showToast(errorMessage, 'error');
    }
  };

  const rejectTransaction = async (transactionId) => {
    try {
      await axios.put(`${API}/admin/transactions/${transactionId}/reject`, {}, {
        headers: getAuthHeaders()
      });

      showToast('Transacción rechazada', 'success');
      await loadAdminData();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Error al rechazar transacción';
      showToast(errorMessage, 'error');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/admin/messages`, messageForm, {
        headers: getAuthHeaders()
      });

      showToast('Mensaje enviado exitosamente', 'success');
      setMessageForm({ to_user_id: '', subject: '', content: '' });
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Error al enviar mensaje';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Dirección copiada al portapapeles', 'success');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('Dirección copiada al portapapeles', 'success');
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await axios.put(`${API}/admin/notifications/${notificationId}/read`, {}, {
        headers: getAuthHeaders()
      });
      await loadAdminData();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBalance = (balance) => {
    return `€${balance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div className="dashboard-title-section">
            <Link to="/home" className="home-btn" title="Inicio">
              <HomeIcon size="base" />
            </Link>
            <h1>Panel de Control</h1>
          </div>
          <div className="balance-card">
            <h3>Balance Actual</h3>
            <div className="balance-amount">{formatBalance(user.balance)}</div>
          </div>
        </div>

        <div className="dashboard-nav">
          <button 
            className={`dashboard-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <ChartBarIcon size="sm" />
            Resumen
          </button>
          <button 
            className={`dashboard-tab ${activeTab === 'deposits' ? 'active' : ''}`}
            onClick={() => setActiveTab('deposits')}
          >
            <WalletIcon size="sm" />
            Depósitos
          </button>
          <button 
            className={`dashboard-tab ${activeTab === 'withdrawals' ? 'active' : ''}`}
            onClick={() => setActiveTab('withdrawals')}
          >
            <BankNotesIcon size="sm" />
            Retiros
          </button>
          <button 
            className={`dashboard-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <ClockIcon size="sm" />
            Historial
          </button>
          {user && user.is_admin && (
            <button 
              className={`dashboard-tab ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <CogIcon size="sm" />
              Administración
            </button>
          )}
        </div>

        <div className="dashboard-content">
          {/* Overview Tab */}
          <div className={`dashboard-section ${activeTab === 'overview' ? 'active' : ''}`}>
            <div className="overview-welcome">
              <div className="welcome-message">
                <h2><RocketIcon size="lg" /> ¡Bienvenido de vuelta, {user.name}!</h2>
                <p>Tu centro de comando para trading profesional</p>
              </div>
              <div className="quick-stats">
                <div className="stat-mini">
                  <div className="stat-icon"><WalletIcon size="xl" className="success" /></div>
                  <div className="stat-content">
                    <div className="stat-label">Balance</div>
                    <div className="stat-value">{formatBalance(user.balance)}</div>
                  </div>
                </div>
                <div className="stat-mini">
                  <div className="stat-icon"><CheckCircleIcon size="xl" className="success" /></div>
                  <div className="stat-content">
                    <div className="stat-label">Estado</div>
                    <div className="stat-value">Activo</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="trading-section-enhanced">
              <div className="section-header">
                <h2><BoltIcon size="lg" /> Trading en Tiempo Real</h2>
                <div className="live-indicator">
                  <span className="pulse-dot"></span>
                  EN VIVO
                </div>
              </div>
              
              <div className="trading-grid-enhanced">
                {tradingData.map((pair, index) => (
                  <div key={index} className="trading-card-enhanced">
                    <div className="trading-card-header">
                      <div className="trading-pair-enhanced">{pair.pair}</div>
                      <div className="trading-status-live"><CheckCircleIcon size="xs" className="success" /> ACTIVO</div>
                    </div>
                    
                    <div className="trading-value-main">
                      €{pair.value.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                    
                    <div className="trading-stats-enhanced">
                      <div className="trading-stat-item">
                        <div className="stat-icon-small">
                          {pair.change >= 0 ? 
                            <TrendUpIcon className="success" /> : 
                            <TrendDownIcon className="error" />
                          }
                        </div>
                        <div className="stat-details">
                          <div className="stat-label-small">Cambio 24h</div>
                          <div className={`stat-value-small ${pair.change >= 0 ? 'positive' : 'negative'}`}>
                            {pair.change >= 0 ? '+' : ''}{pair.change.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="trading-stat-item">
                        <div className="stat-icon-small">
                          {pair.direction === 'LONG' ? 
                            <TrendUpIcon className="success" /> : 
                            <TrendDownIcon className="error" />
                          }
                        </div>
                        <div className="stat-details">
                          <div className="stat-label-small">Dirección</div>
                          <div className={`stat-value-small ${pair.direction.toLowerCase()}`}>
                            {pair.direction}
                          </div>
                        </div>
                      </div>
                      
                      <div className="trading-stat-item">
                        <div className="stat-icon-small"><BoltIcon /></div>
                        <div className="stat-details">
                          <div className="stat-label-small">Apalancamiento</div>
                          <div className="stat-value-small">
                            <span className="leverage-badge">{pair.leverage}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="trading-card-footer">
                      <div className="trend-indicator">
                        {pair.change >= 0 ? 
                          <><TrendUpIcon size="sm" className="success" /> Tendencia alcista</> : 
                          <><TrendDownIcon size="sm" className="error" /> Tendencia bajista</>
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="trading-footer">
                <div className="market-status">
                  <span className="market-icon">🌍</span>
                  <span>Mercados globales • Actualización cada 4 segundos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Deposits Tab */}
          <div className={`dashboard-section ${activeTab === 'deposits' ? 'active' : ''}`}>
            <div className="section-header-with-info">
              <h2><MoneyIcon size="lg" /> Depósitos</h2>
              <div className="security-badge">
                <LockIcon size="sm" />
                <span>Plataforma 100% Segura</span>
              </div>
            </div>

            {/* Security Information */}
            <div className="security-info-card">
              <div className="security-features">
                <div className="security-feature">
                  <ShieldIcon size="sm" />
                  <span>Encriptación SSL de nivel bancario</span>
                </div>
                <div className="security-feature">
                  <CheckCircleIcon size="sm" />
                  <span>Verificación manual por administrador</span>
                </div>
                <div className="security-feature">
                  <SmartphoneIcon size="sm" />
                  <span>Notificaciones instantáneas de transacciones</span>
                </div>
                <div className="security-feature">
                  <BuildingIcon size="sm" />
                  <span>Fondos protegidos con sistemas institucionales</span>
                </div>
              </div>
            </div>

            <div className="deposit-options">
              <div className="deposit-card">
                <div className="deposit-card-header">
                  <h3><GemIcon size="lg" /> Depósito desde Billetera</h3>
                  <div className="trust-indicator">
                    <span className="trust-stars"><StarIcon size="sm" /><StarIcon size="sm" /><StarIcon size="sm" /><StarIcon size="sm" /><StarIcon size="sm" /></span>
                    <span className="trust-text">Más Popular</span>
                  </div>
                </div>
                
                <div className="deposit-benefits">
                  <div className="benefit-item">
                    <BoltIcon size="sm" />
                    <span>Procesamiento rápido (15-30 min)</span>
                  </div>
                  <div className="benefit-item">
                    <TargetIcon size="sm" />
                    <span>Comisiones bajas del mercado</span>
                  </div>
                  <div className="benefit-item">
                    <LockIcon size="sm" />
                    <span>Direcciones verificadas y seguras</span>
                  </div>
                </div>

                <form onSubmit={handleCryptoDeposit}>
                  <div className="form-group">
                    <label className="form-label">Criptomoneda</label>
                    <select 
                      className="form-control" 
                      value={depositForm.crypto}
                      onChange={(e) => setDepositForm({...depositForm, crypto: e.target.value})}
                      required
                    >
                      <option value="">Seleccionar criptomoneda</option>
                      <option value="BTC">₿ Bitcoin (BTC)</option>
                      <option value="ETH">Ξ Ethereum (ETH)</option>
                      <option value="USDT">₮ Tether (USDT)</option>
                      <option value="BNB">🔸 Binance Coin (BNB)</option>
                      <option value="ADA">₳ Cardano (ADA)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cantidad (€)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      min="10" 
                      step="0.01"
                      placeholder="Mínimo €10.00"
                      value={depositForm.amount}
                      onChange={(e) => setDepositForm({...depositForm, amount: e.target.value})}
                      required 
                    />
                    <div className="amount-info">
                      <span className="info-icon">ℹ️</span>
                      <span>Depósito mínimo: €10 • Sin comisiones ocultas</span>
                    </div>
                  </div>
                  {depositForm.crypto && walletAddresses[depositForm.crypto] && (
                    <div className="form-group">
                      <label className="form-label">📋 Dirección de depósito verificada:</label>
                      <div className="wallet-address-display">
                        <div className="wallet-address">
                          {walletAddresses[depositForm.crypto]}
                        </div>
                        <button 
                          type="button"
                          className="copy-btn"
                          onClick={() => copyToClipboard(walletAddresses[depositForm.crypto])}
                        >
                          📋 Copiar
                        </button>
                      </div>
                      <div className="deposit-instructions">
                        <p><strong>⚠️ Instrucciones importantes:</strong></p>
                        <ul>
                          <li>Envía exactamente €{depositForm.amount} a esta dirección</li>
                          <li>Tu depósito será verificado por nuestro equipo de seguridad</li>
                          <li>Recibirás confirmación por email y notificación interna</li>
                          <li>Tiempo de procesamiento: 15-30 minutos</li>
                        </ul>
                        <div className="security-reminder">
                          <span className="security-icon">🛡️</span>
                          <span>Esta dirección está verificada y es 100% segura</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Enviando...' : '💸 Enviar Solicitud Segura'}
                  </button>
                </form>
              </div>

              <div className="deposit-card">
                <div className="deposit-card-header">
                  <h3>🎫 Depósito con CryptoVoucher</h3>
                  <div className="trust-indicator">
                    <span className="trust-stars">⭐⭐⭐⭐⭐</span>
                    <span className="trust-text">Instantáneo</span>
                  </div>
                </div>

                <div className="deposit-benefits">
                  <div className="benefit-item">
                    <span className="benefit-icon">⚡</span>
                    <span>Procesamiento instantáneo</span>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">🎁</span>
                    <span>Sin comisiones adicionales</span>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">✅</span>
                    <span>Validación automática</span>
                  </div>
                </div>

                <form onSubmit={handleVoucherDeposit}>
                  <div className="form-group">
                    <label className="form-label">Código de Voucher</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Ej: CV-XXXX-XXXX-XXXX"
                      value={voucherForm.voucher_code}
                      onChange={(e) => setVoucherForm({...voucherForm, voucher_code: e.target.value.toUpperCase()})}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cantidad del Voucher (€)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      min="10" 
                      step="0.01"
                      placeholder="Cantidad indicada en tu voucher"
                      value={voucherForm.amount}
                      onChange={(e) => setVoucherForm({...voucherForm, amount: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="voucher-info">
                    <p><strong>ℹ️ Sobre los CryptoVouchers:</strong></p>
                    <ul>
                      <li>Válidos por 12 meses desde la compra</li>
                      <li>Verificación instantánea y automática</li>
                      <li>Fondos disponibles inmediatamente</li>
                      <li>Compatible con todas las tiendas CryptoVoucher</li>
                    </ul>
                    <div className="security-reminder">
                      <span className="security-icon">🛡️</span>
                      <span>Validación segura con tecnología blockchain</span>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Validando...' : '🎫 Canjear Voucher Seguro'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Withdrawals Tab */}
          <div className={`dashboard-section ${activeTab === 'withdrawals' ? 'active' : ''}`}>
            <div className="section-header-with-info">
              <h2>💸 Retiros</h2>
              <div className="security-badge">
                <span className="security-icon">🔒</span>
                <span>Procesamiento Seguro</span>
              </div>
            </div>

            {/* Security Information for Withdrawals */}
            <div className="security-info-card">
              <div className="security-features">
                <div className="security-feature">
                  <span className="feature-icon">⚡</span>
                  <span>Procesamiento en 24-48 horas</span>
                </div>
                <div className="security-feature">
                  <span className="feature-icon">🛡️</span>
                  <span>Verificación de seguridad multicapa</span>
                </div>
                <div className="security-feature">
                  <span className="feature-icon">📧</span>
                  <span>Confirmación por email antes del envío</span>
                </div>
                <div className="security-feature">
                  <span className="feature-icon">💳</span>
                  <span>Compatible con múltiples métodos de pago</span>
                </div>
              </div>
            </div>

            <div className="withdrawal-options">
              <div className="withdrawal-card">
                <div className="withdrawal-card-header">
                  <h3>💳 PayPal</h3>
                  <div className="trust-indicator">
                    <span className="trust-stars">⭐⭐⭐⭐⭐</span>
                    <span className="trust-text">Más Rápido</span>
                  </div>
                </div>

                <div className="withdrawal-benefits">
                  <div className="benefit-item">
                    <span className="benefit-icon">⚡</span>
                    <span>Procesamiento en 2-6 horas</span>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">🌍</span>
                    <span>Disponible en 200+ países</span>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">💰</span>
                    <span>Comisiones competitivas</span>
                  </div>
                </div>

                <form onSubmit={handleWithdrawal}>
                  <input type="hidden" value="paypal" onChange={(e) => setWithdrawalForm({...withdrawalForm, method: e.target.value})} />
                  <div className="form-group">
                    <label className="form-label">Email de PayPal Verificado</label>
                    <input 
                      type="email" 
                      className="form-control"
                      placeholder="tu-email@paypal.com"
                      value={withdrawalForm.email}
                      onChange={(e) => setWithdrawalForm({...withdrawalForm, email: e.target.value, method: 'paypal'})}
                      required 
                    />
                    <div className="security-note">
                      <span className="security-icon">🔐</span>
                      <span>Verificaremos que el email coincida con tu cuenta</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cantidad (€)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      min="10" 
                      step="0.01"
                      max={user.balance}
                      placeholder={`Máximo: €${user.balance.toFixed(2)}`}
                      value={withdrawalForm.amount}
                      onChange={(e) => setWithdrawalForm({...withdrawalForm, amount: e.target.value, method: 'paypal'})}
                      required 
                    />
                    <div className="amount-info">
                      <span className="info-icon">ℹ️</span>
                      <span>Retiro mínimo: €10 • Balance disponible: €{user.balance.toFixed(2)}</span>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Procesando...' : '💳 Solicitar Retiro PayPal'}
                  </button>
                </form>
              </div>

              <div className="withdrawal-card">
                <div className="withdrawal-card-header">
                  <h3>🏦 Transferencia Bancaria</h3>
                  <div className="trust-indicator">
                    <span className="trust-stars">⭐⭐⭐⭐⭐</span>
                    <span className="trust-text">Más Seguro</span>
                  </div>
                </div>

                <div className="withdrawal-benefits">
                  <div className="benefit-item">
                    <span className="benefit-icon">🛡️</span>
                    <span>Máxima seguridad bancaria</span>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">💶</span>
                    <span>Sin límites de cantidad</span>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">🇪🇺</span>
                    <span>SEPA (24-48h) dentro de la UE</span>
                  </div>
                </div>

                <form onSubmit={handleWithdrawal}>
                  <div className="form-group">
                    <label className="form-label">IBAN</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="ES XX XXXX XXXX XXXX XXXX XXXX"
                      value={withdrawalForm.iban}
                      onChange={(e) => setWithdrawalForm({...withdrawalForm, iban: e.target.value.toUpperCase(), method: 'bank'})}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nombre del Banco</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="Ej: Banco Santander, BBVA, CaixaBank..."
                      value={withdrawalForm.bank_name}
                      onChange={(e) => setWithdrawalForm({...withdrawalForm, bank_name: e.target.value, method: 'bank'})}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cantidad (€)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      min="10" 
                      step="0.01"
                      max={user.balance}
                      placeholder={`Máximo: €${user.balance.toFixed(2)}`}
                      value={withdrawalForm.amount}
                      onChange={(e) => setWithdrawalForm({...withdrawalForm, amount: e.target.value, method: 'bank'})}
                      required 
                    />
                  </div>
                  <div className="security-note">
                    <span className="security-icon">🛡️</span>
                    <span>Verificación adicional para transferencias mayores a €1000</span>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Procesando...' : '🏦 Solicitar Transferencia'}
                  </button>
                </form>
              </div>

              <div className="withdrawal-card">
                <div className="withdrawal-card-header">
                  <h3>📱 Bizum</h3>
                  <div className="trust-indicator">
                    <span className="trust-stars">⭐⭐⭐⭐⭐</span>
                    <span className="trust-text">Solo España</span>
                  </div>
                </div>

                <div className="withdrawal-benefits">
                  <div className="benefit-item">
                    <span className="benefit-icon">⚡</span>
                    <span>Inmediato (pocos minutos)</span>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">🇪🇸</span>
                    <span>Exclusivo para España</span>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">📱</span>
                    <span>Directo a tu móvil</span>
                  </div>
                </div>

                <form onSubmit={handleWithdrawal}>
                  <div className="form-group">
                    <label className="form-label">Número de Teléfono</label>
                    <input 
                      type="tel" 
                      className="form-control"
                      placeholder="+34 XXX XXX XXX"
                      value={withdrawalForm.phone}
                      onChange={(e) => setWithdrawalForm({...withdrawalForm, phone: e.target.value, method: 'bizum'})}
                      required 
                    />
                    <div className="security-note">
                      <span className="security-icon">📱</span>
                      <span>Debe ser el número asociado a tu cuenta Bizum</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cantidad (€)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      min="10" 
                      step="0.01"
                      max={Math.min(user.balance, 500)}
                      placeholder={`Máximo Bizum: €500`}
                      value={withdrawalForm.amount}
                      onChange={(e) => setWithdrawalForm({...withdrawalForm, amount: e.target.value, method: 'bizum'})}
                      required 
                    />
                    <div className="amount-info">
                      <span className="info-icon">ℹ️</span>
                      <span>Límite Bizum: €500 por operación</span>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Procesando...' : '📱 Solicitar Bizum'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* History Tab */}
          <div className={`dashboard-section ${activeTab === 'history' ? 'active' : ''}`}>
            <h2>Historial de Transacciones</h2>
            <div className="transactions-list">
              {transactions.length === 0 ? (
                <div style={{textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem'}}>
                  No hay transacciones
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-info">
                      <div className="transaction-type">
                        {transaction.type === 'deposit' ? 'Depósito' : 'Retiro'}
                      </div>
                      <div className="transaction-method">{transaction.method}</div>
                      <div className="transaction-date">{formatDate(transaction.created_at)}</div>
                      <div style={{color: 'var(--color-text-secondary)', fontSize: '12px'}}>
                        {transaction.details}
                      </div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px'}}>
                      <div className={`transaction-amount ${transaction.type}`}>
                        {transaction.type === 'deposit' ? '+' : '-'}{formatBalance(transaction.amount)}
                      </div>
                      <div className={`transaction-status ${transaction.status}`}>
                        {transaction.status === 'completed' ? 'Completado' : 
                         transaction.status === 'pending' ? 'Pendiente' : 'Fallido'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Admin Tab */}
          {user.is_admin && (
            <div className={`dashboard-section ${activeTab === 'admin' ? 'active' : ''}`}>
              <h2>Panel de Administración</h2>
              
              <div className="admin-stats">
                <div className="stat-card">
                  <h3>Usuarios Registrados</h3>
                  <div className="stat-value">{adminStats.total_users}</div>
                </div>
                <div className="stat-card">
                  <h3>Balance Total</h3>
                  <div className="stat-value">{formatBalance(adminStats.total_balance)}</div>
                </div>
                <div className="stat-card">
                  <h3>Notificaciones</h3>
                  <div className="stat-value">{notifications.filter(n => !n.read).length}</div>
                </div>
              </div>

              {/* Notifications */}
              <div style={{marginBottom: '2rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                  <h3>📬 Notificaciones Recientes</h3>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => setNotificationsExpanded(!notificationsExpanded)}
                  >
                    {notificationsExpanded ? '📁 Plegar' : '📂 Expandir'}
                  </button>
                </div>
                {notificationsExpanded && (
                  <div className="notifications-list">
                    {notifications.slice(0, 10).map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        onClick={() => markNotificationRead(notification.id)}
                        style={{cursor: 'pointer'}}
                      >
                        <div className="notification-header">
                          <div className="notification-title">{notification.title}</div>
                          <div className="notification-date">
                            {formatDate(notification.created_at)}
                          </div>
                        </div>
                        <div className="notification-message">{notification.message}</div>
                        {notification.data && (
                          <div className="notification-data">
                            {JSON.stringify(notification.data, null, 2)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Send Message to User */}
              <div style={{marginBottom: '2rem'}}>
                <h3>💬 Enviar Mensaje a Usuario</h3>
                <div className="card">
                  <form onSubmit={sendMessage}>
                    <div className="form-group">
                      <label className="form-label">Usuario Destinatario</label>
                      <select 
                        className="form-control"
                        value={messageForm.to_user_id}
                        onChange={(e) => setMessageForm({...messageForm, to_user_id: e.target.value})}
                        required
                      >
                        <option value="">Seleccionar usuario</option>
                        {allUsers.filter(u => !u.is_admin).map(userData => (
                          <option key={userData.id} value={userData.id}>
                            {userData.name} ({userData.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Asunto</label>
                      <input 
                        type="text"
                        className="form-control"
                        placeholder="Asunto del mensaje"
                        value={messageForm.subject}
                        onChange={(e) => setMessageForm({...messageForm, subject: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mensaje</label>
                      <textarea 
                        className="form-control"
                        rows="4"
                        placeholder="Escribe tu mensaje aquí..."
                        value={messageForm.content}
                        onChange={(e) => setMessageForm({...messageForm, content: e.target.value})}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Enviando...' : '💬 Enviar Mensaje'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Admin Transaction Management */}
              <div className="admin-transactions">
                <h3>⚡ Transacciones Pendientes</h3>
                <div className="transactions-list">
                  {allTransactions.filter(t => t.status === 'pending').length === 0 ? (
                    <div style={{textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem'}}>
                      No hay transacciones pendientes
                    </div>
                  ) : (
                    allTransactions.filter(t => t.status === 'pending').map((transaction) => (
                      <div key={transaction.id} className="transaction-admin-item pending">
                        <div className="transaction-info">
                          <div className="transaction-type">
                            🏦 {transaction.type === 'deposit' ? 'Depósito' : 'Retiro'} - {transaction.method}
                          </div>
                          <div className="transaction-method">
                            Usuario: {allUsers.find(u => u.id === transaction.user_id)?.name || 'Desconocido'}
                          </div>
                          <div className="transaction-date">{formatDate(transaction.created_at)}</div>
                          <div style={{color: 'var(--color-text-secondary)', fontSize: '12px'}}>
                            {transaction.details}
                          </div>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px'}}>
                          <div className="transaction-amount deposit">
                            €{transaction.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="transaction-admin-actions">
                            <button 
                              className="btn btn-approve btn-sm"
                              onClick={() => approveTransaction(transaction.id)}
                            >
                              ✅ Aprobar
                            </button>
                            <button 
                              className="btn btn-reject btn-sm"
                              onClick={() => rejectTransaction(transaction.id)}
                            >
                              ❌ Rechazar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* User Management */}
              <div className="users-management">
                <h3>Gestión de Usuarios</h3>
                <div className="users-list">
                  {allUsers.map((userData) => (
                    <div key={userData.id} className="user-item">
                      <div className="user-info">
                        <div className="user-name">
                          {userData.name} {userData.is_admin && '(Admin)'}
                        </div>
                        <div className="user-email">{userData.email}</div>
                      </div>
                      <div className="balance-controls">
                        <div className="user-balance">{formatBalance(userData.balance)}</div>
                        <input 
                          type="number" 
                          className="form-control balance-input" 
                          placeholder="Nueva cantidad" 
                          step="0.01"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              updateUserBalance(userData.id, parseFloat(e.target.value));
                              e.target.value = '';
                            }
                          }}
                        />
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={(e) => {
                            const input = e.target.previousElementSibling;
                            updateUserBalance(userData.id, parseFloat(input.value));
                            input.value = '';
                          }}
                        >
                          Actualizar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;