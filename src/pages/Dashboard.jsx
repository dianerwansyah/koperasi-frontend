import React, { Suspense } from "react";
import { useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { menus } from "../config/menuConfig";
import DashboardAdmin from "./admin/DashboardAdmin";
import DashboardKaryawan from "./karyawan/DashboardKaryawan";
import { lazyWithFallback } from "../components/lazyWithFallback";

export default function Dashboard() {
  const { user, token } = useSelector((state) => state.auth);
  const [loadingAuth, setLoadingAuth] = React.useState(true);

  React.useEffect(() => {
    if (token && user) setLoadingAuth(false);
    else {
      const timer = setTimeout(() => setLoadingAuth(false), 300);
      return () => clearTimeout(timer);
    }
  }, [token, user]);

  if (loadingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-xl text-primary"></span>
      </div>
    );
  }

  if (!token || !user) return <Navigate to="/login" replace />;

  const filteredMenus = menus.filter((menu) => menu.roles.includes(user.role));
  const DashboardFallback =
    user.role === "admin" ? DashboardAdmin : DashboardKaryawan;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-grow p-6 bg-gray-50 overflow-auto">
          <Suspense
            fallback={<div className="text-center py-10">Loading...</div>}
          >
            <Routes>
              <Route path="/dashboard" element={<DashboardFallback />} />
              <Route path="/" element={<DashboardFallback />} />

              {filteredMenus.map((menu) => {
                const Component = lazyWithFallback(
                  () => import(`./${menu.component}`),
                  () => <div className="text-center py-10">Loading...</div> // fallback loading
                );

                return (
                  <Route
                    key={menu.id}
                    path={`/${menu.path}`}
                    element={<Component />}
                  />
                );
              })}

              <Route path="*" element={<DashboardFallback />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
