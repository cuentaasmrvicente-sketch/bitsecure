import React, { useEffect, useState } from 'react';

const Toast = ({ message, type, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show toast after component mounts
    setTimeout(() => setShow(true), 100);
    
    // Auto close after 4 seconds
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300); // Wait for animation to finish
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type} ${show ? 'show' : ''}`}>
      <div className="toast-title">
        {type === 'success' ? 'Éxito' : 'Error'}
      </div>
      <div className="toast-message">{message}</div>
    </div>
  );
};

export default Toast;