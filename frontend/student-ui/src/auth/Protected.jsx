import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const Protected = ({ roles, children }) => {
  const { me, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!me) return <Navigate to="/login" replace />;
  if (roles && !roles.some(r => me.roles.includes(r))) return <div>403 Forbidden</div>;
  return children;
};
