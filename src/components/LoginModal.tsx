import React from 'react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Login Required</h3>
                <p className="text-slate-600 mb-6">Please log in to sync your data with the cloud.</p>
                <button onClick={onClose} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold">Close</button>
            </div>
        </div>
    );
};
