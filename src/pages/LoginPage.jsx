import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, fetchUser } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "../components/ToastHelper";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchUser());
    }
  }, [token, user, dispatch]);

  useEffect(() => {
    if (user) {
      showSuccessToast(`Selamat datang ${user.name || ""}`);
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    dispatch(login({ email, password }))
      .unwrap()
      .catch(() => {});
  };

  return (
    <div
      data-theme="light"
      className="min-h-screen flex items-center justify-center bg-base-200 px-4"
    >
      <div className="max-w-md w-full bg-base-100 p-10 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-center mb-8 text-base-content">
          Welcome Back
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">Email</span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">Password</span>
            </label>
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? "Login in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
