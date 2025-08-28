import React, { useState, useEffect, useCallback } from "react";
import api from "../../api/api";
import { showErrorToast } from "../../components/ToastHelper";
import Pagination from "../../components/Pagination";
import Filter from "../../components/Filter";
import { endOfMonth, format } from "date-fns";

export default function FormDaftarSimpanan() {
  const [savingsList, setSavingsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const [summary, setSummary] = useState({ wajib: 0, pokok: 0, bagiHasil: 0 });

  const [filters, setFilters] = useState({
    date: "",
    type: "",
  });

  const filterConfig = [
    { key: "date", label: "Date", type: "month" },
    {
      key: "type",
      label: "Jenis Simpanan",
      type: "select",
      options: [
        { value: "wajib", label: "Wajib" },
        { value: "pokok", label: "Pokok" },
      ],
    },
  ];

  const fetchSavings = useCallback(
    async (page = 1, limit = 10, appliedFilters = filters) => {
      setLoading(true);
      try {
        const params = { page, limit };

        Object.entries(appliedFilters).forEach(([key, value]) => {
          if (!value) return;

          if (key === "date") {
            // kalau value format "YYYY-MM"
            if (/^\d{4}-\d{2}$/.test(value)) {
              const startDate = `${value}-01`;
              const endDate = format(
                endOfMonth(new Date(startDate)),
                "yyyy-MM-dd"
              );

              params["start_date"] = startDate;
              params["end_date"] = endDate;
            } else {
              // kalau langsung YYYY-MM-DD
              params[key] = value;
            }
          } else {
            params[key] = value;
          }
        });

        const res = await api.get("/api/savings", { params });

        const data = res.data.data || [];
        setSavingsList(data);

        setTotal(res.data.total);
        setPerPage(res.data.per_page);
        setCurrentPage(res.data.current_page);
        setLastPage(res.data.last_page);

        if (res.data.summary) {
          setSummary({
            wajib: res.data.summary.total_wajib ?? 0,
            pokok: res.data.summary.total_pokok ?? 0,
            bagiHasil: res.data.summary.total_bagi_hasil ?? 0,
          });
        }
      } catch {
        showErrorToast("Gagal mengambil data simpanan");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchSavings(currentPage, perPage, filters);
  }, [filters, currentPage, perPage, fetchSavings]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const reset = { date: "", type: "" };
    setFilters(reset);
    setCurrentPage(1);
  };

  return (
    <div data-theme="light" className="p-6 bg-base-200 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Daftar Simpanan</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="text-sm font-semibold">Total Simpanan Wajib</h3>
            <p className="text-xl font-bold text-primary">
              Rp {summary.wajib.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="text-sm font-semibold">Total Simpanan Pokok</h3>
            <p className="text-xl font-bold text-primary">
              Rp {summary.pokok.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="text-sm font-semibold">Total Bagi Hasil</h3>
            <p className="text-xl font-bold text-primary">
              Rp {summary.bagiHasil.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <Filter
        filters={filterConfig}
        values={filters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {loading ? (
        <div className="flex justify-center items-center p-6">
          <span className="loading loading-spinner text-primary text-4xl"></span>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-base-100 shadow rounded p-4">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Tanggal</th>
                  <th>Jenis Simpanan</th>
                  <th>Besar Simpanan</th>
                  <th>Bagi Hasil</th>
                </tr>
              </thead>
              <tbody>
                {savingsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">
                      Belum ada data simpanan
                    </td>
                  </tr>
                ) : (
                  savingsList.map((s, idx) => (
                    <tr key={s.id}>
                      <td>{(currentPage - 1) * perPage + idx + 1}</td>
                      <td>{s.date}</td>
                      <td>{s.type}</td>
                      <td>Rp {parseFloat(s.value).toLocaleString()}</td>
                      <td>
                        Rp {parseFloat(s.bagi_hasil ?? 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            perPage={perPage}
            total={total}
            lastPage={lastPage}
            onPageChange={(page) => setCurrentPage(page)}
            onPerPageChange={(limit) => {
              setPerPage(limit);
              setCurrentPage(1);
            }}
          />
        </>
      )}
    </div>
  );
}
