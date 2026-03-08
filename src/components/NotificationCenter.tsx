import React from 'react';
import { Bell } from 'lucide-react';

const NotificationCenter: React.FC = () => {
    return (
        <div className="relative">
            <Bell className="w-5 h-5 text-slate-500" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>
    );
};

export default NotificationCenter;
