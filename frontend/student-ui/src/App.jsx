import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./auth/AuthContext";
import { Protected } from "./auth/Protected";
import Login from "./pages/Login";
import './App.css'

import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import TeacherDashboard from "./pages/Dashboard/TeacherDashboard";
import TeacherStudents from "./pages/Dashboard/TeacherStudents";
import TeacherCourses from "./pages/Dashboard/TeacherCourses";
import StudentDashboard from "./pages/Dashboard/StudentDashboard";

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
          <Route
            path="/teacher"
            element={
              <Protected roles={["Teacher"]}>
                  <TeacherDashboard />
              </Protected>
            }
          />
          <Route
            path="/teacher/students"
            element={
              <Protected roles={["Teacher"]}>
                <TeacherStudents />
              </Protected>
            }
          />
          <Route
            path="/teacher/courses"
            element={
              <Protected roles={["Teacher"]}>
                <TeacherCourses />
              </Protected>
            }
          />
          <Route
            path="/student"
            element={
              <Protected roles={["Student"]}>
                  <StudentDashboard />
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
