import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, Trash2, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { useNotifications, Notification, NotificationType } from '../contexts/NotificationContext';

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
    case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    default: return <Info className="w-5 h-5 text-blue-500" />;
  }
};

const NotificationCenter: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // minutes
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 className="font-semibold text-slate-800">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                  title="Mark all as read"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button 
                  onClick={clearAll}
                  className="text-xs text-slate-500 hover:text-red-600 font-medium flex items-center gap-1"
                  title="Clear all"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                <Bell className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 hover:bg-slate-50 transition-colors relative group cursor-pointer ${notification.read ? 'opacity-60 bg-slate-50/50' : 'bg-white'}`}
                    onClick={() => {
                      markAsRead(notification.id);
                      if (notification.target) {
                        navigate(notification.target);
                        setIsOpen(false);
                      }
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1 flex-shrink-0">
                        <NotificationIcon type={notification.type} />
                      </div>
                      <div className="flex-1 pr-4">
                        <p className={`text-sm font-medium ${notification.read ? 'text-slate-600' : 'text-slate-900'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1.5">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="absolute top-2 right-2 p-1 text-slate-300 hover:text-slate-500 hover:bg-slate-200 rounded opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    {!notification.read && (
                      <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-500 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
