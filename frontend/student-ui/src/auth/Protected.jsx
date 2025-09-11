import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const Protected = ({ roles, children }) => {
  const { me, loading } = useAuth();

  // Yüklenirken hiçbir yere yönlendirme
  if (loading) return null; // istersen burada spinner döndürebilirsin

  // Oturum yoksa login'e
  if (!me) return <Navigate to="/login" replace />;

  // Rol kısıtı varsa kontrol et
  if (roles && roles.length > 0) {
    const userRoles = me.roles || [];
    const allowed = roles.some((r) => userRoles.includes(r));
    if (!allowed) return <Navigate to="/login" replace />;
  }

  return children;
};
