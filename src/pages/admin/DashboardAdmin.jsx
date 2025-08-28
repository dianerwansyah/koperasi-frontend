import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { showErrorToast } from "../../components/ToastHelper";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export default function DashboardAdmin() {
  const [loading, setLoading] = useState(true);
  const [loanSummary, setLoanSummary] = useState({
    applied: 0,
    approved: 0,
    rejected: 0,
  });
  const [settlementSummary, setSettlementSummary] = useState({
    applied: 0,
    approved: 0,
    rejected: 0,
  });
  const [summary, setSummary] = useState({
    totalWajib: 0,
    totalPokok: 0,
    totalBagiHasil: 0,
    totalSimpanan: 0,
  });
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  const COLORS = ["#4ade80", "#f87171"];

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      // 1Pinjaman
      const loanRes = await api.get("/api/loans", {
        params: { start_date: startOfMonth, end_date: endOfMonth },
      });
      const loans = loanRes.data.data;
      setLoanSummary({
        applied: loans.filter((l) => l.status === "applied").length,
        approved: loans.filter((l) => l.status === "approved").length,
        rejected: loans.filter((l) => l.status === "rejected").length,
      });

      //  Pelunasan
      const settleRes = await api.get("/api/settlement", {
        params: { start_date: startOfMonth, end_date: endOfMonth },
      });
      const settlements = settleRes.data.data;
      setSettlementSummary({
        applied: settlements.filter((s) => s.status === "applied").length,
        approved: settlements.filter((s) => s.status === "approved").length,
        rejected: settlements.filter((s) => s.status === "rejected").length,
      });

      // Simpanan
      const resSavings = await api.get("/api/savings");
      const data = resSavings.data.data;
      const summaryData = resSavings.data.summary;

      const totalSimpanan = summaryData.total_wajib + summaryData.total_pokok;
      setSummary({
        totalWajib: summaryData.total_wajib,
        totalPokok: summaryData.total_pokok,
        totalBagiHasil: summaryData.total_bagi_hasil,
        totalSimpanan,
      });

      // BarChart per bulan
      const monthsMap = {};
      data.forEach((item) => {
        const dateObj = new Date(item.date);
        const month = dateObj.toLocaleString("default", { month: "short" });
        if (!monthsMap[month]) monthsMap[month] = { month, wajib: 0, pokok: 0 };
        if (item.type === "wajib")
          monthsMap[month].wajib += parseFloat(item.value);
        if (item.type === "pokok")
          monthsMap[month].pokok += parseFloat(item.value);
      });
      setBarData(Object.values(monthsMap));

      // PieChart
      setPieData([
        { name: "Wajib", value: summaryData.total_wajib },
        { name: "Pokok", value: summaryData.total_pokok },
      ]);

      // Recent transactions
      const recent = data
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
      setRecentTransactions(recent);
    } catch (err) {
      showErrorToast("Gagal mengambil data dashboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center p-6 min-h-screen">
        <span className="loading loading-spinner text-primary text-4xl"></span>
      </div>
    );

  return (
    <div data-theme="light" className="p-6 bg-base-200 min-h-screen space-y-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard Admin</h2>

      {/* Pinjaman & Pelunasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          "Pinjaman Applied",
          "Pinjaman Approved",
          "Pinjaman Rejected",
          "Pelunasan Applied",
          "Pelunasan Approved",
          "Pelunasan Rejected",
        ].map((title, idx) => {
          const value =
            idx < 3
              ? Object.values(loanSummary)[idx]
              : Object.values(settlementSummary)[idx - 3];
          return (
            <div
              key={title}
              className="card bg-base-100 shadow hover:shadow-lg p-4"
            >
              <h3 className="text-sm text-gray-500 font-medium">{title}</h3>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          );
        })}
      </div>

      {/* Simpanan Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          "Total Simpanan",
          "Simpanan Wajib",
          "Simpanan Pokok",
          "Total Bagi Hasil",
        ].map((title, idx) => {
          const value = [
            summary.totalSimpanan,
            summary.totalWajib,
            summary.totalPokok,
            summary.totalBagiHasil,
          ][idx];
          return (
            <div
              key={title}
              className="card bg-base-100 shadow hover:shadow-lg p-4"
            >
              <h3 className="text-sm text-gray-500 font-medium">{title}</h3>
              <p className="text-2xl font-bold">{value.toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card bg-base-100 shadow hover:shadow-lg p-4">
          <h3 className="text-lg font-medium mb-4">Simpanan per Bulan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v) => v.toLocaleString()} />
              <Legend />
              <Bar dataKey="wajib" fill="#4ade80" />
              <Bar dataKey="pokok" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card bg-base-100 shadow hover:shadow-lg p-4">
          <h3 className="text-lg font-medium mb-4">Proporsi Simpanan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) =>
                  `${entry.name}: ${(
                    (entry.value / summary.totalSimpanan) *
                    100
                  ).toFixed(1)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => v.toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card bg-base-100 shadow hover:shadow-lg p-4 overflow-x-auto">
        <h3 className="text-lg font-medium mb-4">Recent Simpanan</h3>
        <table className="table table-zebra table-compact w-full">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Karyawan</th>
              <th>Tanggal</th>
              <th>Jenis</th>
              <th>Besar Simpanan</th>
              <th>Bagi Hasil</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  Belum ada data
                </td>
              </tr>
            ) : (
              recentTransactions.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>{item.user?.name}</td>
                  <td>{item.date}</td>
                  <td>{item.type}</td>
                  <td>{parseFloat(item.value).toLocaleString()}</td>
                  <td>{parseFloat(item.bagi_hasil).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
