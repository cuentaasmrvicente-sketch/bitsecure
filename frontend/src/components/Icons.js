import React from 'react';

// Icon wrapper component for consistent styling
const IconWrapper = ({ children, className = '', size = 'base' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    base: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
    '3xl': 'w-12 h-12'
  };

  return (
    <div className={`icon-wrapper ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
};

// Home Icon
export const HomeIcon = ({ size = 'base', className = '' }) => (
  <IconWrapper size={size} className={className}>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
      <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.432z" />
    </svg>
  </IconWrapper>
);

// Chart Bar Icon (Trading)
export const ChartBarIcon = ({ size = 'base', className = '' }) => (
  <IconWrapper size={size} className={className}>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
    </svg>
  </IconWrapper>
);

// Wallet Icon (Money/Deposits)
export const WalletIcon = ({ size = 'base', className = '' }) => (
  <IconWrapper size={size} className={className}>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M2.273 5.625A4.483 4.483 0 015.25 4.5h13.5c1.141 0 2.25.384 3.026 1.062.802.7 1.274 1.677 1.274 2.688 0 .993-.472 1.988-1.274 2.688A4.483 4.483 0 0118.75 12H5.25a2.25 2.25 0 01-2.25-2.25V6.75a2.25 2.25 0 01.273-1.125zm16.477 3.75c.59 0 1.125-.378 1.125-.938 0-.56-.535-.937-1.125-.937H5.25a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75h13.5z" />
      <path d="M1.5 15a.75.75 0 01.75-.75h19.5a.75.75 0 010 1.5H2.25A.75.75 0 011.5 15zM1.5 18a.75.75 0 01.75-.75h19.5a.75.75 0 010 1.5H2.25A.75.75 0 011.5 18z" />
    </svg>
  </IconWrapper>
);

// Bank Notes Icon (Withdrawals)
export const BankNotesIcon = ({ size = 'base', className = '' }) => (
  <IconWrapper size={size} className={className}>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
      <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 01-.75.75h.008a.75.75 0 01.742-.75zm0 2.25a.75.75 0 01-.75.75h.008a.75.75 0 01.742-.75zM5.25 9a.75.75 0 01-.75.75h.008A.75.75 0 015.25 9zm0 2.25a.75.75 0 01-.75.75h.008a.75.75 0 01.742-.75z" clipRule="evenodd" />
    </svg>
  </IconWrapper>
);

// History Icon (Clock)
export const ClockIcon = ({ size = 'base', className = '' }) => (
  <IconWrapper size={size} className={className}>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
    </svg>
  </IconWrapper>
);

// Settings Icon (Admin Panel)
export const CogIcon = ({ size = 'base', className = '' }) => (
  <IconWrapper size={size} className={className}>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.570.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.570.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348L13.928 3.817c-.15-.904-.933-1.567-1.85-1.567h-1.844zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
    </svg>
  </IconWrapper>
);

// Shield Icon (Security)
export const ShieldIcon = ({ size = 'base', className = '' }) => (
  <IconWrapper size={size} className={className}>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.814 3.051 10.923 7.634 13.769a.75.75 0 00.732 0C15.199 20.673 18.25 15.564 18.25 9.75c0-1.357-.195-2.669-.556-3.914a.75.75 0 00-.722-.516 11.209 11.209 0 01-7.877-3.08z" clipRule="evenodd" />
    </svg>
  </IconWrapper>
);

// Check Circle Icon (Success)
export const CheckCircleIcon = ({ size = 'base', className = '' }) => (
  <IconWrapper size={size} className={className}>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  </IconWrapper>
);

// Lightning Bolt Icon (Fast/Live)
export const BoltIcon = ({ size = 'base', className = '' }) => (
  <IconWrapper size={size} className={className}>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71L10.018 14.25H2.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
    </svg>
  </IconWrapper>
);

// Users Icon (User Management)
export const UsersIcon = ({ size = 'base', className = '' }) => (
  <IconWrapper size={size} className={className}>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
    </svg>
  </IconWrapper>
);

// Bell Icon (Notifications)
export const BellIcon = ({ size = 'base', className = '' }) => (
  <IconWrapper size={size} className={className}>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
    </svg>
  </IconWrapper>
);

// Chat Bubble Icon (Messages)
export const ChatBubbleIcon = ({ size = 'base', className = '' }) => (
  <IconWrapper size={size} className={className}>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clipRule="evenodd" />
    </svg>
  </IconWrapper>
);

// Ticket Icon (Voucher)
export const TicketIcon = ({ size = 'base', className = '' }) => (
  <IconWrapper size={size} className={className}>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M1.5 6.375c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v3.026a.75.75 0 01-.375.65 2.249 2.249 0 000 3.898.75.75 0 01.375.65v3.026c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 17.625v-3.026a.75.75 0 01.374-.65 2.249 2.249 0 000-3.898.75.75 0 01-.374-.65V6.375zm15-1.125a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75zm.75 4.5a.75.75 0 00-1.5 0v.75a.75.75 0 001.5 0v-.75zm-.75 3a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zm.75 4.5a.75.75 0 00-1.5 0v.75a.75.75 0 001.5 0V17zM6 12a.75.75 0 01.75-.75H12a.75.75 0 010 1.5H6.75A.75.75 0 016 12zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
    </svg>
  </IconWrapper>
);

// Globe Icon (Global/World)
export const GlobeIcon = ({ size = 'base', className = '' }) => (
  <IconWrapper size={size} className={className}>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM6.262 6.072a8.25 8.25 0 1010.562-.766 4.5 4.5 0 01-1.318 1.357L14.25 7.5l.165.33a.809.809 0 01-1.086 1.085l-.604-.302a1.125 1.125 0 00-1.298.21l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 01-2.288 4.04l-.723.724a1.125 1.125 0 01-1.298.21l-.153-.076a1.125 1.125 0 01-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 01-.21-1.298L9.75 12l-1.64-1.64a6 6 0 01-1.676-3.257l-.172-1.03z" clipRule="evenodd" />
    </svg>
  </IconWrapper>
);

// Trend Up Icon (Positive trend)
export const TrendUpIcon = ({ size = 'base', className = '' }) => (
  <IconWrapper size={size} className={className}>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M15.22 6.268a.75.75 0 01.968-.432l5.942 2.28a.75.75 0 01.431.97l-2.28 5.941a.75.75 0 11-1.4-.537l1.63-4.251-1.086.484a11.2 11.2 0 00-5.45 5.174.75.75 0 01-1.199.19L9 12.31l-6.22 6.22a.75.75 0 11-1.06-1.06l6.75-6.75a.75.75 0 011.06 0l3.606 3.605a12.694 12.694 0 015.68-4.973l1.086-.483-4.251-1.632a.75.75 0 01-.432-.97z" clipRule="evenodd" />
    </svg>
  </IconWrapper>
);

// Trend Down Icon (Negative trend)
export const TrendDownIcon = ({ size = 'base', className = '' }) => (
  <IconWrapper size={size} className={className}>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M1.72 5.47a.75.75 0 011.06 0L9 11.69l3.756-3.756a.75.75 0 01.985-.066 12.698 12.698 0 015.68 4.973l1.086-.483-4.251-1.632a.75.75 0 01.537-1.4l5.942 2.28c.415.16.622.616.431.97l-2.28 5.941a.75.75 0 11-1.4-.537l1.63-4.251-1.086.484a11.2 11.2 0 00-5.45 5.174.75.75 0 01-1.199-.19L9 15.31l-6.22 6.22a.75.75 0 11-1.06-1.06l6.75-6.75a.75.75 0 011.06 0l3.606 3.605a12.694 12.694 0 015.68-4.973l1.086-.483-4.251 1.632a.75.75 0 01-.432-.97z" clipRule="evenodd" />
    </svg>
  </IconWrapper>
);

// Document Text Icon (Information)
export const DocumentTextIcon = ({ size = 'base', className = '' }) => (
  <IconWrapper size={size} className={className}>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
      <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
    </svg>
  </IconWrapper>
);

export default {
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
  GlobeIcon,
  TrendUpIcon,
  TrendDownIcon,
  DocumentTextIcon
};