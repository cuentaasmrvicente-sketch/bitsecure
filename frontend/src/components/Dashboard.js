import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = ({ user, setUser, showToast, getAuthHeaders, API }) => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [tradingData, setTradingData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [adminStats, setAdminStats] = useState({ total_users: 0, total_balance: 0 });
  const [allUsers, setAllUsers] = useState([]);
  const [walletAddresses, setWalletAddresses] = useState({});
  const [loading, setLoading] = useState(false);

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
              🏠
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
            Resumen
          </button>
          <button 
            className={`dashboard-tab ${activeTab === 'deposits' ? 'active' : ''}`}
            onClick={() => setActiveTab('deposits')}
          >
            Depósitos
          </button>
          <button 
            className={`dashboard-tab ${activeTab === 'withdrawals' ? 'active' : ''}`}
            onClick={() => setActiveTab('withdrawals')}
          >
            Retiros
          </button>
          <button 
            className={`dashboard-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Historial
          </button>
          {user.is_admin && (
            <button 
              className={`dashboard-tab ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              Administración
            </button>
          )}
        </div>

        <div className="dashboard-content">
          {/* Overview Tab */}
          <div className={`dashboard-section ${activeTab === 'overview' ? 'active' : ''}`}>
            <div className="trading-section">
              <h2>Trading en Vivo</h2>
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
          </div>

          {/* Deposits Tab */}
          <div className={`dashboard-section ${activeTab === 'deposits' ? 'active' : ''}`}>
            <h2>Depósitos</h2>
            <div className="deposit-options">
              <div className="deposit-card">
                <h3>Depósito desde Billetera</h3>
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
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="USDT">Tether (USDT)</option>
                      <option value="BNB">Binance Coin (BNB)</option>
                      <option value="ADA">Cardano (ADA)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tu Dirección de Billetera</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Ingresa la dirección de tu billetera"
                      value={depositForm.wallet_address}
                      onChange={(e) => setDepositForm({...depositForm, wallet_address: e.target.value})}
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
                      value={depositForm.amount}
                      onChange={(e) => setDepositForm({...depositForm, amount: e.target.value})}
                      required 
                    />
                  </div>
                  {depositForm.crypto && walletAddresses[depositForm.crypto] && (
                    <div className="form-group">
                      <label className="form-label">Enviar a esta dirección:</label>
                      <div style={{
                        padding: '12px',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-base)',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        wordBreak: 'break-all'
                      }}>
                        {walletAddresses[depositForm.crypto]}
                      </div>
                    </div>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Procesando...' : 'Realizar Depósito'}
                  </button>
                </form>
              </div>

              <div className="deposit-card">
                <h3>Depósito con CryptoVoucher</h3>
                <form onSubmit={handleVoucherDeposit}>
                  <div className="form-group">
                    <label className="form-label">Código de Voucher</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Ingresa el código del voucher"
                      value={voucherForm.voucher_code}
                      onChange={(e) => setVoucherForm({...voucherForm, voucher_code: e.target.value})}
                      required 
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Canjeando...' : 'Canjear Voucher'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Withdrawals Tab */}
          <div className={`dashboard-section ${activeTab === 'withdrawals' ? 'active' : ''}`}>
            <h2>Retiros</h2>
            <div className="withdrawal-options">
              <div className="withdrawal-card">
                <h3>PayPal</h3>
                <form onSubmit={handleWithdrawal}>
                  <input type="hidden" value="paypal" onChange={(e) => setWithdrawalForm({...withdrawalForm, method: e.target.value})} />
                  <div className="form-group">
                    <label className="form-label">Email de PayPal</label>
                    <input 
                      type="email" 
                      className="form-control"
                      value={withdrawalForm.email}
                      onChange={(e) => setWithdrawalForm({...withdrawalForm, email: e.target.value, method: 'paypal'})}
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
                      value={withdrawalForm.amount}
                      onChange={(e) => setWithdrawalForm({...withdrawalForm, amount: e.target.value, method: 'paypal'})}
                      required 
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Procesando...' : 'Solicitar Retiro'}
                  </button>
                </form>
              </div>

              <div className="withdrawal-card">
                <h3>Transferencia Bancaria</h3>
                <form onSubmit={handleWithdrawal}>
                  <div className="form-group">
                    <label className="form-label">IBAN</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={withdrawalForm.iban}
                      onChange={(e) => setWithdrawalForm({...withdrawalForm, iban: e.target.value, method: 'bank'})}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nombre del Banco</label>
                    <input 
                      type="text" 
                      className="form-control"
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
                      value={withdrawalForm.amount}
                      onChange={(e) => setWithdrawalForm({...withdrawalForm, amount: e.target.value, method: 'bank'})}
                      required 
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Procesando...' : 'Solicitar Retiro'}
                  </button>
                </form>
              </div>

              <div className="withdrawal-card">
                <h3>Bizum</h3>
                <form onSubmit={handleWithdrawal}>
                  <div className="form-group">
                    <label className="form-label">Número de Teléfono</label>
                    <input 
                      type="tel" 
                      className="form-control"
                      value={withdrawalForm.phone}
                      onChange={(e) => setWithdrawalForm({...withdrawalForm, phone: e.target.value, method: 'bizum'})}
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
                      value={withdrawalForm.amount}
                      onChange={(e) => setWithdrawalForm({...withdrawalForm, amount: e.target.value, method: 'bizum'})}
                      required 
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Procesando...' : 'Solicitar Retiro'}
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
                <h3>Notificaciones Recientes</h3>
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