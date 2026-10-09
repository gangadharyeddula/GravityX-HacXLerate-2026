import { createContext, useContext, useEffect, useState } from 'react';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const token = localStorage.getItem('creatortwin_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch (error) {
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAuthToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setAuthToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const demoLogin = async (role) => {
    const email = role === 'brand' ? 'brand@demo.com' : 'creator@demo.com';
    return login(email, 'demo123');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, demoLogin, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
