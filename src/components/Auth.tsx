import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Auth: React.FC = () => {
    const { login } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [secret, setSecret] = useState('');

    const handleLogin = async () => {
        await login(identifier, secret, 'PASSWORD');
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            <input 
                type="text" 
                placeholder="Identifier" 
                value={identifier} 
                onChange={e => setIdentifier(e.target.value)} 
                className="border p-2 mb-2 rounded"
            />
            <input 
                type="password" 
                placeholder="Secret" 
                value={secret} 
                onChange={e => setSecret(e.target.value)} 
                className="border p-2 mb-4 rounded"
            />
            <button onClick={handleLogin} className="bg-blue-500 text-white p-2 rounded">Login</button>
        </div>
    );
};
