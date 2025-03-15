import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string, password: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(username, password);
    if (!success) {
      setError('არასწორი მომხმარებლის სახელი ან პაროლი');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="bg-white p-8 md:p-12 rounded-lg shadow-md w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center">
        <h2 className="text-2xl font-bold mb-2">ექიმის შესვლა</h2>
        <p className="text-gray-600 mb-6">შეიყვანეთ თქვენი მომხმარებლის სახელი და პაროლი</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">მომხმარებლის სახელი</label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">პაროლი</label>
            <input 
              type="password" 
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="mr-2" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              დამიმახსოვრე
            </label>
            <a href="#" className="text-blue-600 hover:text-blue-800">დაგავიწყდათ პაროლი?</a>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            შესვლა
          </button>
        </form>
      </div>
      
      <div className="hidden md:flex items-center justify-center bg-blue-600 flex-1 p-8 rounded-lg ml-0 md:ml-8 mt-6 md:mt-0">
        <div className="text-center text-white max-w-md">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">სამედიცინო ტრანსკრიფციის სისტემა</h1>
          <p className="text-lg mb-8">
            გაამარტივეთ სამედიცინო დოკუმენტაციის პროცესი ჩვენი AI-ზე დაყრდნობილი ტრანსკრიფციის სისტემით. დაზოგეთ დრო და გააუმჯობესეთ თქვენი პაციენტების მომსახურება.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;