import React from 'react';

export default function LoginForm({ password, setPassword, onLogin }) {
  return (
    <div className="max-w-md mx-auto mt-20 p-8 border rounded">
      <h2 className="text-xl font-bold mb-4">Accès admin</h2>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Mot de passe"
        className="mb-4 p-2 border rounded w-full"
      />
      <button
        onClick={onLogin}
        className="px-4 py-2 bg-blue-500 text-white rounded font-bold"
      >
        Se connecter
      </button>
    </div>
  );
}
