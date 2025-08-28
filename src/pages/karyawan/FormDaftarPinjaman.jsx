import React, { useState, useEffect, useCallback } from "react";
import api from "../../api/api";
import { showErrorToast } from "../../components/ToastHelper";
import Pagination from "../../components/Pagination";
import Filter from "../../components/Filter";
import ModalForm from "../../components/ModalForm";
import { endOfMonth, format } from "date-fns";

export default function FormDaftarPinjaman() {
  const [pinjamanList, setPinjamanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const [filters, setFilters] = useState({
    date: "",
    status: "",
  });

  // Modal state
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [modalValues, setModalValues] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const filterConfig = [
    { key: "date", label: "Date", type: "month" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "applied", label: "Applied" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
      ],
    },
  ];

  // Fetch function
  const fetchPinjaman = useCallback(
    async (page = 1, limit = 10) => {
      setLoading(true);
      try {
        const params = { page, limit };

        Object.entries(filters).forEach(([key, value]) => {
          if (!value) return;

          if (key === "date") {
            // kalau value format "YYYY-MM"
            if (/^\d{4}-\d{2}$/.test(value)) {
              const startDate = `${value}-01`;
              const endDate = format(
                endOfMonth(new Date(startDate)),
                "yyyy-MM-dd"
              );

              params["date_start"] = startDate;
              params["date_end"] = endDate;
            } else {
              // kalau langsung YYYY-MM-DD
              params[key] = value;
            }
          } else {
            params[key] = value;
          }
        });

        const res = await api.get("/api/loans", { params });

        setPinjamanList(res.data.data);
        setTotal(res.data.total);
        setPerPage(res.data.per_page);
        setCurrentPage(res.data.current_page);
        setLastPage(res.data.last_page);
      } catch {
        showErrorToast("Gagal mengambil data pinjaman");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // useEffect untuk fetch awal
  useEffect(() => {
    fetchPinjaman(currentPage, perPage, filters);
  }, [filters, currentPage, perPage, fetchPinjaman]);

  // Apply & Reset Filters
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };
  const handleResetFilters = () => {
    setFilters({ date: "", status: "" });
    setCurrentPage(1);
  };

  // Modal input config
  const modalInputs = [
    { name: "proof_path", label: "Bukti Transfer", type: "file" },
  ];

  // Submit modal
  const handleSubmitModal = async () => {
    if (!modalValues.proof_path || !selectedLoan) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("loan_id", selectedLoan.id);
      formData.append("proof_path", modalValues.proof_path);

      await api.post("/api/settlement", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      fetchPinjaman(currentPage, perPage);
      setSelectedLoan(null);
      setModalValues({});
    } catch {
      showErrorToast("Gagal upload bukti transfer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-theme="light" className="p-6 bg-base-200 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Daftar Pinjaman</h2>

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
                  <th>date</th>
                  <th>Besar Pinjaman</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pinjamanList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center">
                      Belum ada pinjaman
                    </td>
                  </tr>
                ) : (
                  pinjamanList.map((p, idx) => (
                    <tr key={p.id}>
                      <th>{(currentPage - 1) * perPage + idx + 1}</th>
                      <td>{p.apply_date}</td>
                      <td>{p.amount}</td>
                      <td>{p.status}</td>
                      <td>
                        {p.status === "approved" && (
                          <>
                            {!p.settlement_status && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => setSelectedLoan(p)}
                              >
                                Lunasi
                              </button>
                            )}
                            {p.settlement_status && (
                              <span
                                className={`badge badge-sm ${
                                  p.settlement_status === "applied"
                                    ? "badge-warning"
                                    : p.settlement_status === "approved"
                                    ? "badge-success"
                                    : "badge-error"
                                }`}
                              >
                                {p.settlement_status === "applied"
                                  ? "SUDAH DI LUNASI - WAITING APPROVAL ADMIN"
                                  : p.settlement_status.toUpperCase()}
                              </span>
                            )}
                          </>
                        )}
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
              setCurrentPage(1);
              setPerPage(limit);
            }}
          />
        </>
      )}

      {/* Form Modal */}
      {selectedLoan && (
        <ModalForm
          title={`Upload Bukti Transfer - Pinjaman #${selectedLoan.id}`}
          inputs={modalInputs}
          values={modalValues}
          setValues={setModalValues}
          onSubmit={handleSubmitModal}
          submitting={submitting}
          onClose={() => {
            setSelectedLoan(null);
            setModalValues({});
          }}
        />
      )}
    </div>
  );
}
