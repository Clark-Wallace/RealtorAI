import { useState, useEffect, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Notification Context
const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

// Notification Provider
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      ...notification,
      createdAt: new Date()
    };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto-dismiss after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const notify = {
    success: (message, options = {}) => 
      addNotification({ type: 'success', message, ...options }),
    error: (message, options = {}) => 
      addNotification({ type: 'error', message, duration: 0, ...options }),
    warning: (message, options = {}) => 
      addNotification({ type: 'warning', message, ...options }),
    info: (message, options = {}) => 
      addNotification({ type: 'info', message, ...options })
  };

  return (
    <NotificationContext.Provider value={{ notify, removeNotification }}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </NotificationContext.Provider>
  );
};

// Notification Container
const NotificationContainer = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="flex flex-col gap-2">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            notification={notification}
            onRemove={() => onRemove(notification.id)}
          />
        ))}
      </div>
    </div>
  );
};

// Individual Notification
const Notification = ({ notification, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(onRemove, 300);
  };

  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    warning: <AlertTriangle className="text-yellow-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />
  };

  const styles = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <div
      className={`
        pointer-events-auto max-w-sm w-full bg-white rounded-lg shadow-lg border-2 p-4
        transform transition-all duration-300 ease-out
        ${styles[notification.type]}
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        animate-slide-in-right
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icons[notification.type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {notification.message}
          </p>
          {notification.description && (
            <p className="mt-1 text-sm text-gray-600">
              {notification.description}
            </p>
          )}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          onClick={handleRemove}
          className="flex-shrink-0 ml-2 p-1 rounded hover:bg-gray-100 transition-colors"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
};

// CSS for slide-in animation (add to index.css)
const animationStyles = `
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
`;

export default NotificationProvider;