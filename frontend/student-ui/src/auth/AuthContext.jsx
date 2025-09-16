/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { AuthApi } from "../api/auth";

const Ctx = createContext({
  me: null,
  loading: true,
  refresh: async () => false,
  logout: async () => {},
});

export const AuthContext = ({ children }) => {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    (async () => {
      await refresh();
    })();
  }, []);

  const refresh = async () => {
    try {
      const { data } = await AuthApi.me();
      setMe(data);
      setLoading(false);
      return true;
    } catch {
      setMe(null);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AuthApi.logout();
    } finally {
      setMe(null);
    }
  };

  return (
    <Ctx.Provider value={{ me, loading, refresh, logout }}>
      {children}
    </Ctx.Provider>
  );
};

// Hook
export const useAuth = () => useContext(Ctx);
