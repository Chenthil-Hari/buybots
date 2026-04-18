import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const USERS_KEY = 'buybots_users';
const CURRENT_USER_KEY = 'buybots_current_user';

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [user]);

  const register = (name, email, password, role, capabilities = {}) => {
    const users = getStoredUsers();
    if (users.find(u => u.email === email)) {
      throw new Error('An account with this email already exists.');
    }
    const newUser = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name,
      email,
      password,
      role, // 'user' or 'seller'
      // Seller capabilities
      capabilities: role === 'seller' ? {
        canAssemble: capabilities.canAssemble || false,
        hasPartsInStock: capabilities.hasPartsInStock || false,
      } : null,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    const { password: _, ...safeUser } = newUser;
    setUser(safeUser);
    return safeUser;
  };

  const login = (email, password) => {
    const users = getStoredUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      throw new Error('Invalid email or password.');
    }
    const { password: _, ...safeUser } = found;
    setUser(safeUser);
    return safeUser;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
