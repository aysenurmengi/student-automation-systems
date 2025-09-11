import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./auth/AuthContext";
import { Protected } from "./auth/Protected";
import Login from "./pages/Login";
import './App.css'

function App() {

  return (
    <AuthContext>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="*" element={<Navigate to="/login" replace/>} />
        </Routes>
      </BrowserRouter>
    </AuthContext>
  );
}

export default App
