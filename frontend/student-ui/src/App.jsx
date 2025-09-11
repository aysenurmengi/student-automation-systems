import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./auth/AuthContext";
import { Protected } from "./auth/Protected";
import Login from "./pages/Login";
import './App.css'

import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import AppLayout from "./components/AppLayout";

function App() {

  return (
    <BrowserRouter>
      <AuthContext>
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route
            path="/admin"
            element={
              <Protected roles={["Admin"]}>
                  <AdminDashboard />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace/>} />
        </Routes>
      </AuthContext>
    </BrowserRouter>
  );
}

export default App
