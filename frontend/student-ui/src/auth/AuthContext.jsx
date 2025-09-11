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

  // Uygulama açılışında oturumu getir
  useEffect(() => {
    (async () => {
      await refresh();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Oturum bilgisini sunucudan yenile
  const refresh = async () => {
    try {
      const { data } = await AuthApi.me(); // 200 ise cookie var
      setMe(data);
      setLoading(false);
      return true; // ✅ başarılı
    } catch {
      setMe(null);
      setLoading(false);
      return false; // ❌ yetkisiz / hata
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
