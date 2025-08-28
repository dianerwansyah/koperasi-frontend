import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { setCredentials } from "./features/auth/authSlice";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import { setAuthToken } from "./api/api";

export default function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  // state untuk menunggu restore auth
  const [authRestored, setAuthRestored] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      setAuthToken(token);
      dispatch(setCredentials({ token, user }));
    }
    setAuthRestored(true); // selesai cek auth
  }, [dispatch]);

  // komponen wrapper untuk proteksi route
  const RequireAuth = ({ children }) => {
    if (!authRestored) return null; // bisa diganti spinner
    if (!token) return <Navigate to="/login" replace />;
    return children;
  };

  const RequireGuest = ({ children }) => {
    if (!authRestored) return null; // tunggu restore auth
    if (token) return <Navigate to="/dashboard" replace />;
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <RequireGuest>
              <LoginPage />
            </RequireGuest>
          }
        />

        <Route
          path="/*"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
      </Routes>

      <ToastContainer />
    </Router>
  );
}
