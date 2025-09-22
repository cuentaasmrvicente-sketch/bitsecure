// BitSecure Finance Application JavaScript

// Application State
let currentUser = null;
let users = [];
let transactions = [];
let tradingUpdateInterval = null;

// Trading data
const tradingPairs = [
    {"pair": "BTC/USDT", "change": 2.61, "direction": "LONG", "leverage": "20x", "value": 25766.2},
    {"pair": "ETH/USDT", "change": -1.51, "direction": "SHORT", "leverage": "10x", "value": 32751.53},
    {"pair": "BNB/USDT", "change": 5.78, "direction": "LONG", "leverage": "5x", "value": 38132.37},
    {"pair": "ADA/USDT", "change": 1.72, "direction": "SHORT", "leverage": "50x", "value": 32971.98}
];

const adminCredentials = {
    email: "admin@bitsecure.com",
    password: "admin123"
};


function roundToPrecision(value, decimals = 2) {
    return Math.round((parseFloat(value) + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function formatCryptoAmount(amount, crypto) {
    if (crypto === 'fiat') {
        return roundToPrecision(amount, 2);
    } else {
        return roundToPrecision(amount, 8); // 8 decimals for crypto
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    // Small delay to ensure all elements are rendered
    setTimeout(initializeApp, 100);
});

function initializeApp() {
    console.log('Initializing app...');
    
    // Load saved data
    loadUsersFromStorage();
    loadTransactionsFromStorage();
    loadCurrentUserFromStorage();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize FAQ
    setupFAQ();
    
    // Start trading updates
    startTradingUpdates();
    
    // Update trading grids
    updateTradingGrid(document.getElementById('tradingGrid'));
    updateTradingGrid(document.getElementById('dashboardTradingGrid'));
    
    // Check if user is logged in
    if (currentUser) {
        showDashboard();
    } else {
        showLandingPage();
    }
    
    console.log('App initialized successfully');
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Auth buttons - with more robust selection and error handling
    setupButtonListener('loginBtn', () => {
        console.log('Login button clicked');
        showAuthPage('login');
    });
    
    setupButtonListener('registerBtn', () => {
        console.log('Register button clicked');
        showAuthPage('register');
    });
    
    setupButtonListener('heroLoginBtn', () => {
        console.log('Hero login button clicked');
        showAuthPage('login');
    });
    
    setupButtonListener('heroRegisterBtn', () => {
        console.log('Hero register button clicked');
        showAuthPage('register');
    });
    
    setupButtonListener('logoutBtn', () => {
        console.log('Logout button clicked');
        logout();
    });
    
    setupButtonListener('backToHome', () => {
        console.log('Back to home clicked');
        showLandingPage();
    });
    
    // Auth tabs
    const authTabs = document.querySelectorAll('.auth-tab');
    console.log('Found auth tabs:', authTabs.length);
    authTabs.forEach((tab, index) => {
        console.log(`Setting up auth tab ${index}:`, tab.dataset.tab);
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabType = e.target.dataset.tab;
            console.log('Auth tab clicked:', tabType);
            switchAuthTab(tabType);
        });
    });
    
    // Auth forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        console.log('Setting up login form');
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        console.log('Setting up register form');
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Dashboard tabs
    const dashboardTabs = document.querySelectorAll('.dashboard-tab');
    console.log('Found dashboard tabs:', dashboardTabs.length);
    dashboardTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabType = e.target.dataset.tab;
            console.log('Dashboard tab clicked:', tabType);
            switchDashboardTab(tabType);
        });
    });
    
    // Forms
    setupFormListener('cryptoDepositForm', handleCryptoDeposit);
    setupFormListener('voucherDepositForm', handleVoucherDeposit);
    setupFormListener('paypalWithdrawalForm', handlePayPalWithdrawal);
    setupFormListener('bankWithdrawalForm', handleBankWithdrawal);
    setupFormListener('bizumWithdrawalForm', handleBizumWithdrawal);
    
    // Mobile menu
    setupButtonListener('mobileMenuToggle', toggleMobileMenu);
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    console.log('Found nav links:', navLinks.length);
    navLinks.forEach((link, index) => {
        console.log(`Setting up nav link ${index}:`, link.getAttribute('href'));
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.getAttribute('href');
            console.log('Nav link clicked:', target);
            if (target) {
                const targetName = target.substring(1);
                if (targetName === 'depositos' || targetName === 'retiros') {
                    if (currentUser) {
                        showDashboard();
                        switchDashboardTab(targetName === 'depositos' ? 'deposits' : 'withdrawals');
                    } else {
                        showAuthPage('login');
                    }
                } else if (targetName === 'trading') {
                    if (currentUser) {
                        showDashboard();
                        switchDashboardTab('overview');
                    } else {
                        // Scroll to trading section on landing page
                        const tradingSection = document.getElementById('trading');
                        if (tradingSection) {
                            tradingSection.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                }
            }
        });
    });
    
    console.log('Event listeners setup complete');
}

function setupButtonListener(buttonId, callback) {
    const button = document.getElementById(buttonId);
    if (button) {
        console.log(`Setting up button listener for: ${buttonId}`);
        button.addEventListener('click', (e) => {
            e.preventDefault();
            callback();
        });
    } else {
        console.warn(`Button not found: ${buttonId}`);
    }
}

function setupFormListener(formId, callback) {
    const form = document.getElementById(formId);
    if (form) {
        console.log(`Setting up form listener for: ${formId}`);
        form.addEventListener('submit', callback);
    }
}

function setupFAQ() {
    console.log('Setting up FAQ...');
    const faqItems = document.querySelectorAll('.faq-item');
    console.log('Found FAQ items:', faqItems.length);
    
    faqItems.forEach((item, index) => {
        const question = item.querySelector('.faq-question');
        if (question) {
            console.log(`Setting up FAQ item ${index}`);
            question.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`FAQ question ${index} clicked`);
                
                const isActive = item.classList.contains('active');
                console.log('Is active:', isActive);
                
                // Close all items
                faqItems.forEach((faqItem, i) => {
                    console.log(`Closing FAQ item ${i}`);
                    faqItem.classList.remove('active');
                });
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    console.log(`Opening FAQ item ${index}`);
                    item.classList.add('active');
                }
            });
        } else {
            console.warn(`FAQ question not found for item ${index}`);
        }
    });
    
    console.log('FAQ setup complete');
}

// Trading Updates
function startTradingUpdates() {
    updateTradingData();
    tradingUpdateInterval = setInterval(updateTradingData, 4000);
}

function updateTradingData() {
    tradingPairs.forEach(pair => {
        // Random price fluctuation
        const fluctuation = (Math.random() - 0.5) * 100;
        pair.value = Math.max(1000, pair.value + fluctuation);
        
        // Random change percentage
        pair.change = (Math.random() - 0.5) * 10;
        
        // Random direction and leverage
        pair.direction = Math.random() > 0.5 ? 'LONG' : 'SHORT';
        const leverageOptions = ['5x', '10x', '20x', '50x'];
        pair.leverage = leverageOptions[Math.floor(Math.random() * leverageOptions.length)];
    });
    
    updateTradingGrid(document.getElementById('tradingGrid'));
    updateTradingGrid(document.getElementById('dashboardTradingGrid'));
}

function updateTradingGrid(gridElement) {
    if (!gridElement) return;
    
    gridElement.innerHTML = '';
    
    tradingPairs.forEach(pair => {
        const card = document.createElement('div');
        card.className = 'trading-card';
        
        const changeClass = pair.change >= 0 ? 'positive' : 'negative';
        const directionClass = pair.direction.toLowerCase();
        
        card.innerHTML = `
            <div class="trading-pair">${pair.pair}</div>
            <div class="trading-stats">
                <div class="trading-stat">
                    <div class="trading-stat-label">Cambio</div>
                    <div class="trading-stat-value trading-change ${changeClass}">
                        ${pair.change >= 0 ? '+' : ''}${pair.change.toFixed(2)}%
                    </div>
                </div>
                <div class="trading-stat">
                    <div class="trading-stat-label">Dirección</div>
                    <div class="trading-stat-value">
                        <span class="trading-direction ${directionClass}">${pair.direction}</span>
                    </div>
                </div>
                <div class="trading-stat">
                    <div class="trading-stat-label">Apalancamiento</div>
                    <div class="trading-stat-value">
                        <span class="trading-leverage">${pair.leverage}</span>
                    </div>
                </div>
                <div class="trading-stat">
                    <div class="trading-stat-label">Valor</div>
                    <div class="trading-stat-value trading-value">€${pair.value.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
            </div>
        `;
        
        gridElement.appendChild(card);
    });
}

// Page Navigation
function showLandingPage() {
    console.log('Showing landing page');
    const landingPage = document.getElementById('landingPage');
    const authPage = document.getElementById('authPage');
    const dashboardPage = document.getElementById('dashboardPage');
    
    if (landingPage) landingPage.classList.remove('hidden');
    if (authPage) authPage.classList.add('hidden');
    if (dashboardPage) dashboardPage.classList.add('hidden');
    
    updateUserInterface();
}

function showAuthPage(tab = 'login') {
    console.log('Showing auth page, tab:', tab);
    const landingPage = document.getElementById('landingPage');
    const authPage = document.getElementById('authPage');
    const dashboardPage = document.getElementById('dashboardPage');
    
    if (landingPage) landingPage.classList.add('hidden');
    if (authPage) authPage.classList.remove('hidden');
    if (dashboardPage) dashboardPage.classList.add('hidden');
    
    switchAuthTab(tab);
}

function showDashboard() {
    console.log('Showing dashboard');
    const landingPage = document.getElementById('landingPage');
    const authPage = document.getElementById('authPage');
    const dashboardPage = document.getElementById('dashboardPage');
    
    if (landingPage) landingPage.classList.add('hidden');
    if (authPage) authPage.classList.add('hidden');
    if (dashboardPage) dashboardPage.classList.remove('hidden');
    
    updateUserInterface();
    updateTransactionsList();
    if (isAdmin()) {
        updateAdminPanel();
    }
}

// Authentication
function switchAuthTab(tab) {
    console.log('Switching to auth tab:', tab);
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(authTab => {
        authTab.classList.remove('active');
        if (authTab.dataset.tab === tab) {
            authTab.classList.add('active');
        }
    });
    
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    const activeForm = document.getElementById(`${tab}Form`);
    if (activeForm) {
        activeForm.classList.add('active');
    }
}

function handleLogin(e) {
    e.preventDefault();
    console.log('Handling login');
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Check admin credentials
    if (email === adminCredentials.email && password === adminCredentials.password) {
        currentUser = {
            id: 'admin',
            name: 'Administrador',
            email: email,
            balance: 0,
            isAdmin: true
        };
        saveCurrentUserToStorage();
        showToast('Bienvenido, Administrador', 'success');
        showDashboard();
        return;
    }
    
    // Check regular users
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = { ...user };
        delete currentUser.password; // Remove password from memory
        saveCurrentUserToStorage();
        showToast(`Bienvenido, ${user.name}`, 'success');
        showDashboard();
    } else {
        showToast('Credenciales incorrectas', 'error');
    }
    
    e.target.reset();
}

function handleRegister(e) {
    e.preventDefault();
    console.log('Handling registration');
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        showToast('El email ya está registrado', 'error');
        return;
    }
    
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        balance: 100, // Starting bonus
        cryptoBalances: {
            BTC: 0,
            ETH: 0,
            USDT: 0,
            BNB: 0,
            ADA: 0
        },
        isAdmin: false
    };
    
    users.push(newUser);
    saveUsersToStorage();
    
    currentUser = { ...newUser };
    delete currentUser.password;
    saveCurrentUserToStorage();
    
    showToast(`Registro exitoso. Bienvenido, ${name}! Tienes €100 de bonus`, 'success');
    showDashboard();
    
    e.target.reset();
}

function logout() {
    console.log('Logging out');
    currentUser = null;
    try {
        localStorage.removeItem('bitsecureCurrentUser');
    } catch (e) {
        console.error('Error removing user from storage:', e);
    }
    updateUserInterface();
    showToast('Sesión cerrada correctamente', 'success');
    showLandingPage();
}


function calculateTotalBalance() {
    if (!currentUser || !currentUser.cryptoBalances) return currentUser?.balance || 0;

    // Sumar balance fiat + todas las criptomonedas
    let totalCrypto = 0;
    Object.values(currentUser.cryptoBalances).forEach(balance => {
        totalCrypto += balance;
    });

    return (currentUser.balance || 0) + totalCrypto;
}

function updateBalanceDisplay() {
    const totalBalance = calculateTotalBalance();
    const userBalance = document.getElementById('userBalance');
    if (userBalance) {
        userBalance.textContent = totalBalance.toLocaleString('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
}

function updateUserInterface() {
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const userBalance = document.getElementById('userBalance');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (currentUser) {
        if (userMenu) userMenu.classList.remove('hidden');
        if (authButtons) {
            authButtons.querySelectorAll('.auth-btn').forEach(btn => {
                btn.classList.add('hidden');
            });
        }
        if (userName) userName.textContent = currentUser.name;
        if (userBalance) userBalance.textContent = `€${currentUser.balance.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        
        // Show admin tab if user is admin
        if (isAdmin()) {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.classList.add('show');
            });
        }
    } else {
        if (userMenu) userMenu.classList.add('hidden');
        if (authButtons) {
            authButtons.querySelectorAll('.auth-btn').forEach(btn => {
                btn.classList.remove('hidden');
            });
        }
        document.querySelectorAll('.admin-only').forEach(el => {
            el.classList.remove('show');
        });
    }
}

function isAdmin() {
    return currentUser && currentUser.isAdmin;
}

// Dashboard
function switchDashboardTab(tab) {
    const dashboardTabs = document.querySelectorAll('.dashboard-tab');
    dashboardTabs.forEach(dashTab => {
        dashTab.classList.remove('active');
        if (dashTab.dataset.tab === tab) {
            dashTab.classList.add('active');
        }
    });
    
    const dashboardSections = document.querySelectorAll('.dashboard-section');
    dashboardSections.forEach(section => {
        section.classList.remove('active');
    });
    
    const activeSection = document.getElementById(tab);
    if (activeSection) {
        activeSection.classList.add('active');
    }
}

// Deposits
function handleCryptoDeposit(e) {
    e.preventDefault();
    
    const crypto = document.getElementById('cryptoSelect').value;
    const walletAddress = document.getElementById('walletAddress').value;
    const amount = parseFloat(document.getElementById('depositAmount').value);
    
    if (!crypto) {
        showToast('Selecciona una criptomoneda', 'error');
        return;
    }
    
    if (!walletAddress) {
        showToast('Ingresa la dirección de billetera', 'error');
        return;
    }
    
    if (amount < 10) {
        showToast('El monto mínimo de depósito es €10', 'error');
        return;
    }
    
    showToast('Procesando depósito...', 'success');
    
    // Simulate deposit processing
    setTimeout(() => {
        currentUser.balance = roundToPrecision((currentUser.balance || 0) + amount, 2);
        updateUserInStorage();
        
        const transaction = {
            id: Date.now().toString(),
            userId: currentUser.id,
            type: 'deposit',
            method: `Crypto (${crypto})`,
            amount: amount,
            details: `Dirección: ${walletAddress.substring(0, 10)}...`,
            status: 'completed',
            date: new Date().toISOString()
        };
        
        transactions.push(transaction);
        saveTransactionsToStorage();
        
        showToast(`Depósito de €${amount} realizado exitosamente`, 'success');
        const userBalance = document.getElementById('userBalance');
        if (userBalance) {
            userBalance.textContent = `€${currentUser.balance.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }
        updateTransactionsList();
        
        e.target.reset();
    }, 2000);
}

function handleVoucherDeposit(e) {
    e.preventDefault();
    
    const voucherCode = document.getElementById('voucherCode').value;
    
    if (!voucherCode) {
        showToast('Ingresa el código del voucher', 'error');
        return;
    }
    
    showToast('Validando voucher...', 'success');
    
    // Simulate voucher validation and random amount
    const amount = Math.floor(Math.random() * 500) + 50; // Random amount between 50-550
    
    setTimeout(() => {
        currentUser.balance = roundToPrecision((currentUser.balance || 0) + amount, 2);
        updateUserInStorage();
        
        const transaction = {
            id: Date.now().toString(),
            userId: currentUser.id,
            type: 'deposit',
            method: 'CryptoVoucher',
            amount: amount,
            details: `Código: ${voucherCode}`,
            status: 'completed',
            date: new Date().toISOString()
        };
        
        transactions.push(transaction);
        saveTransactionsToStorage();
        
        showToast(`Voucher canjeado: €${amount} añadido a tu balance`, 'success');
        const userBalance = document.getElementById('userBalance');
        if (userBalance) {
            userBalance.textContent = `€${currentUser.balance.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }
        updateTransactionsList();
        
        e.target.reset();
    }, 1500);
}

// Withdrawals
function handlePayPalWithdrawal(e) {
    e.preventDefault();
    
    const email = document.getElementById('paypalEmail').value;
    const amount = parseFloat(document.getElementById('paypalAmount').value);
    
    if (!email) {
        showToast('Ingresa el email de PayPal', 'error');
        return;
    }
    
    if (amount > currentUser.balance) {
        showToast('Saldo insuficiente', 'error');
        return;
    }
    
    if (amount < 10) {
        showToast('El monto mínimo de retiro es €10', 'error');
        return;
    }
    
    processWithdrawal('PayPal', amount, `Email: ${email}`, e.target);
}

function handleBankWithdrawal(e) {
    e.preventDefault();
    
    const iban = document.getElementById('bankIban').value;
    const bankName = document.getElementById('bankName').value;
    const amount = parseFloat(document.getElementById('bankAmount').value);
    
    if (!iban || !bankName) {
        showToast('Completa todos los campos', 'error');
        return;
    }
    
    if (amount > currentUser.balance) {
        showToast('Saldo insuficiente', 'error');
        return;
    }
    
    if (amount < 10) {
        showToast('El monto mínimo de retiro es €10', 'error');
        return;
    }
    
    processWithdrawal('Transferencia Bancaria', amount, `${bankName} - IBAN: ${iban}`, e.target);
}

function handleBizumWithdrawal(e) {
    e.preventDefault();
    
    const phone = document.getElementById('bizumPhone').value;
    const amount = parseFloat(document.getElementById('bizumAmount').value);
    
    if (!phone) {
        showToast('Ingresa el número de teléfono', 'error');
        return;
    }
    
    if (amount > currentUser.balance) {
        showToast('Saldo insuficiente', 'error');
        return;
    }
    
    if (amount < 10) {
        showToast('El monto mínimo de retiro es €10', 'error');
        return;
    }
    
    processWithdrawal('Bizum', amount, `Teléfono: ${phone}`, e.target);
}


function updateWithdrawBalance(method) {
    const balanceType = document.getElementById(`${method}BalanceType`).value;
    const availableElement = document.getElementById(`${method}Available`);
    const amountInput = document.getElementById(`${method}Amount`);

    if (!currentUser) return;

    if (!balanceType) {
        availableElement.textContent = 'Selecciona un tipo de balance';
        amountInput.max = '';
        return;
    }

    let available = 0;
    let symbol = '';

    if (balanceType === 'fiat') {
        available = currentUser.balance || 0;
        symbol = '€';
        amountInput.step = '0.01';
    } else {
        if (!currentUser.cryptoBalances) {
            currentUser.cryptoBalances = {
                BTC: 0, ETH: 0, USDT: 0, BNB: 0, ADA: 0
            };
        }
        available = currentUser.cryptoBalances[balanceType] || 0;
        symbol = balanceType;
        amountInput.step = '0.0001';
    }

    availableElement.textContent = `Disponible: ${available.toFixed(balanceType === 'fiat' ? 2 : 4)} ${symbol}`;
    amountInput.max = available.toString();
}

function processWithdrawal(method, amount, details, form) {
    showToast('Procesando retiro...', 'success');
    
    setTimeout(() => {
        currentUser.balance -= amount;
        updateUserInStorage();
        
        const transaction = {
            id: Date.now().toString(),
            userId: currentUser.id,
            type: 'withdrawal',
            method: method,
            amount: amount,
            details: details,
            status: 'pending',
            date: new Date().toISOString()
        };
        
        transactions.push(transaction);
        saveTransactionsToStorage();
        
        showToast(`Retiro de €${amount} solicitado exitosamente`, 'success');
        const userBalance = document.getElementById('userBalance');
        if (userBalance) {
            userBalance.textContent = `€${currentUser.balance.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }
        updateTransactionsList();
        
        form.reset();
    }, 2000);
}

// Transactions
function updateTransactionsList() {
    const transactionsList = document.getElementById('transactionsList');
    if (!transactionsList) return;
    
    const userTransactions = transactions.filter(t => t.userId === currentUser.id);
    
    if (userTransactions.length === 0) {
        transactionsList.innerHTML = '<div class="text-center" style="color: rgba(255,255,255,0.7); padding: 2rem;">No hay transacciones</div>';
        return;
    }
    
    transactionsList.innerHTML = '';
    
    userTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(transaction => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        
        const date = new Date(transaction.date);
        const formattedDate = date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'});
        
        item.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-type">${transaction.type === 'deposit' ? 'Depósito' : 'Retiro'}</div>
                <div class="transaction-method">${transaction.method}</div>
                <div class="transaction-date">${formattedDate}</div>
                <div style="color: rgba(255,255,255,0.6); font-size: 12px;">${transaction.details}</div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'deposit' ? '+' : '-'}€${transaction.amount.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
                <div class="transaction-status ${transaction.status}">
                    ${transaction.status === 'completed' ? 'Completado' : 'Pendiente'}
                </div>
            </div>
        `;
        
        transactionsList.appendChild(item);
    });
}

// Admin Panel
function updateAdminPanel() {
    if (!isAdmin()) return;
    
    const totalUsers = document.getElementById('totalUsers');
    const totalBalance = document.getElementById('totalBalance');
    const usersList = document.getElementById('usersList');
    
    // Update stats
    if (totalUsers) totalUsers.textContent = users.length;
    if (totalBalance) {
        const total = users.reduce((sum, user) => sum + user.balance, 0);
        totalBalance.textContent = `€${total.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
    
    // Update users list
    if (usersList) {
        usersList.innerHTML = '';
        
        users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            
            userItem.innerHTML = `
                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-email">${user.email}</div>
                </div>
                <div class="balance-controls">
                    <div class="user-balance">€${user.balance.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <input type="number" class="balance-input" placeholder="Cantidad" step="0.01">
                    <button class="btn btn-primary btn-sm" onclick="updateUserBalance('${user.id}', this)">Actualizar</button>
                </div>
            `;
            
            usersList.appendChild(userItem);
        });
    }
}

function updateUserBalance(userId, button) {
    const input = button.previousElementSibling;
    const amount = parseFloat(input.value);
    
    if (isNaN(amount)) {
        showToast('Ingresa un monto válido', 'error');
        return;
    }


function updateUserCryptoBalance(userId, crypto, button) {
    const input = button.previousElementSibling;
    const amount = parseFloat(input.value);

    if (isNaN(amount)) {
        showToast('Ingresa un monto válido', 'error');
        return;
    }

    const user = users.find(u => u.id === userId);
    if (user) {
        if (!user.cryptoBalances) {
            user.cryptoBalances = {
                BTC: 0, ETH: 0, USDT: 0, BNB: 0, ADA: 0
            };
        }
        user.cryptoBalances[crypto] = formatCryptoAmount(amount, crypto);
        saveUsersToStorage();

        // Update current user if it's the same
        if (currentUser && currentUser.id === userId) {
            if (!currentUser.cryptoBalances) {
                currentUser.cryptoBalances = {
                    BTC: 0, ETH: 0, USDT: 0, BNB: 0, ADA: 0
                };
            }
            currentUser.cryptoBalances[crypto] = amount;
            updateBalanceDisplay();
            saveCurrentUserToStorage();
        }

        updateAdminPanel();
        showToast(`Balance de ${crypto} de ${user.name} actualizado a ${amount}€`, 'success');
        input.value = '';
    }
}
    
    const user = users.find(u => u.id === userId);
    if (user) {
        user.balance = roundToPrecision(amount, 2);
        saveUsersToStorage();
        
        // Update current user if it's the same
        if (currentUser && currentUser.id === userId) {
            currentUser.balance = amount;
            const userBalance = document.getElementById('userBalance');
            if (userBalance) {
                userBalance.textContent = `€${amount.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            }
            saveCurrentUserToStorage();
        }
        
        updateAdminPanel();
        showToast(`Balance de ${user.name} actualizado a €${amount}`, 'success');
        input.value = '';
    }
}

function updateUserInStorage() {
    if (!currentUser) return;
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].balance = currentUser.balance;
        saveUsersToStorage();
    }
    
    saveCurrentUserToStorage();
}

// Storage functions
function saveUsersToStorage() {
    try {
        localStorage.setItem('bitsecureUsers', JSON.stringify(users));
    } catch (e) {
        console.error('Error saving users:', e);
    }
}

function loadUsersFromStorage() {
    try {
        const savedUsers = localStorage.getItem('bitsecureUsers');
        if (savedUsers) {
            users = JSON.parse(savedUsers);
        }
    } catch (e) {
        console.error('Error loading users:', e);
        users = [];
    }
}

function saveCurrentUserToStorage() {
    try {
        localStorage.setItem('bitsecureCurrentUser', JSON.stringify(currentUser));
    } catch (e) {
        console.error('Error saving current user:', e);
    }
}

function loadCurrentUserFromStorage() {
    try {
        const savedUser = localStorage.getItem('bitsecureCurrentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
        }
    } catch (e) {
        console.error('Error loading current user:', e);
        currentUser = null;
    }
}

function saveTransactionsToStorage() {
    try {
        localStorage.setItem('bitsecureTransactions', JSON.stringify(transactions));
    } catch (e) {
        console.error('Error saving transactions:', e);
    }
}

function loadTransactionsFromStorage() {
    try {
        const savedTransactions = localStorage.getItem('bitsecureTransactions');
        if (savedTransactions) {
            transactions = JSON.parse(savedTransactions);
        }
    } catch (e) {
        console.error('Error loading transactions:', e);
        transactions = [];
    }
}

// Toast Notifications
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `
        <div class="toast-title">${type === 'success' ? 'Éxito' : 'Error'}</div>
        <div class="toast-message">${message}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Mobile Menu
function toggleMobileMenu() {
    const mainNav = document.getElementById('mainNav');
    if (mainNav) {
        mainNav.classList.toggle('active');
    }
}

// Global function for admin balance updates
window.updateUserBalance = updateUserBalance;
// Global function for admin balance updates
window.updateUserCryptoBalance = updateUserCryptoBalance;

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (tradingUpdateInterval) {
        clearInterval(tradingUpdateInterval);
    }
});