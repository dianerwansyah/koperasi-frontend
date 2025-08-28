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

export default function DashboardKaryawan() {
  const [loading, setLoading] = useState(true);

  const [loanSummary, setLoanSummary] = useState({
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
      // Pinjaman milik karyawan
      const loanRes = await api.get("/api/loans", { params: { mine: true } });
      const loans = loanRes.data.data;

      const appliedLoan = loans.filter((l) => l.status === "applied").length;
      const approvedLoan = loans.filter((l) => l.status === "approved").length;
      const rejectedLoan = loans.filter((l) => l.status === "rejected").length;

      setLoanSummary({
        applied: appliedLoan,
        approved: approvedLoan,
        rejected: rejectedLoan,
      });

      // Simpanan milik karyawan
      const res = await api.get("/api/savings", { params: { mine: true } });
      const data = res.data.data;
      const summaryData = res.data.summary;

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

      // PieChart Wajib vs Pokok
      setPieData([
        { name: "Wajib", value: summaryData.total_wajib },
        { name: "Pokok", value: summaryData.total_pokok },
      ]);

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

  return (
    <div data-theme="light" className="p-6 bg-base-200 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Dashboard Karyawan</h2>

      {loading ? (
        <div className="flex justify-center items-center p-6">
          <span className="loading loading-spinner text-primary text-4xl"></span>
        </div>
      ) : (
        <>
          {/* Pinjaman Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card bg-base-100 shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">
                Pinjaman Applied
              </h3>
              <p className="text-2xl font-bold">{loanSummary.applied}</p>
            </div>
            <div className="card bg-base-100 shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">
                Pinjaman Approved
              </h3>
              <p className="text-2xl font-bold">{loanSummary.approved}</p>
            </div>
            <div className="card bg-base-100 shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">
                Pinjaman Rejected
              </h3>
              <p className="text-2xl font-bold">{loanSummary.rejected}</p>
            </div>
          </div>

          {/* Simpanan Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card bg-base-100 shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">
                Total Simpanan
              </h3>
              <p className="text-2xl font-bold">
                {summary.totalSimpanan.toLocaleString()}
              </p>
            </div>
            <div className="card bg-base-100 shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">
                Simpanan Wajib
              </h3>
              <p className="text-2xl font-bold">
                {summary.totalWajib.toLocaleString()}
              </p>
            </div>
            <div className="card bg-base-100 shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">
                Simpanan Pokok
              </h3>
              <p className="text-2xl font-bold">
                {summary.totalPokok.toLocaleString()}
              </p>
            </div>
            <div className="card bg-base-100 shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">
                Total Bagi Hasil
              </h3>
              <p className="text-2xl font-bold">
                {summary.totalBagiHasil.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Bar Chart per Bulan */}
            <div className="card bg-base-100 shadow p-4">
              <h3 className="text-lg font-medium mb-4">Simpanan per Bulan</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                  <Bar dataKey="wajib" fill="#4ade80" />
                  <Bar dataKey="pokok" fill="#f87171" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="card bg-base-100 shadow p-4">
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
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="card bg-base-100 shadow p-4">
            <h3 className="text-lg font-medium mb-4">Recent Simpanan</h3>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Karyawan</th>
                    <th>Tanggal</th>
                    <th>Jenis</th>
                    <th>Nilai</th>
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
        </>
      )}
    </div>
  );
}
