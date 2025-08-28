import React, { useState, useEffect, useCallback } from "react";
import api from "../../api/api";
import { showErrorToast } from "../../components/ToastHelper";
import Pagination from "../../components/Pagination";
import Filter from "../../components/Filter";
import ModalForm from "../../components/ModalForm";

export default function FormDataPelunasan() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const [filters, setFilters] = useState({
    nama: "",
    tanggal: "",
    status: "",
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [modalValues, setModalValues] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Filter configuration
  const filterConfig = [
    { key: "nama", label: "Nama Karyawan", type: "text" },
    { key: "tanggal", label: "Tanggal Pelunasan", type: "date" },
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

  // Modal input configuration
  const modalInputs = [
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "approved", label: "Approve" },
        { value: "rejected", label: "Reject" },
      ],
    },
  ];

  // Fetch data
  const fetchData = useCallback(
    async (page = 1, limit = 10) => {
      setLoading(true);
      try {
        const params = { page, limit, ...filters };

        if (filters.tanggal) {
          params.start_date = filters.tanggal;
          params.end_date = filters.tanggal;
          delete params.tanggal;
        }

        const res = await api.get("/api/settlement", { params });
        setDataList(res.data.data);
        setTotal(res.data.total);
        setPerPage(res.data.per_page);
        setCurrentPage(res.data.current_page);
        setLastPage(res.data.last_page);
      } catch {
        showErrorToast("Gagal mengambil data pelunasan");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // useEffect untuk fetch awal
  useEffect(() => {
    fetchData(currentPage, perPage);
  }, [fetchData, currentPage, perPage]);

  // Filter handlers
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };
  const handleResetFilters = () => {
    setFilters({ nama: "", tanggal: "", status: "" });
    setCurrentPage(1);
  };

  // Modal submit
  const handleSubmitModal = async () => {
    if (!modalValues.status || !selectedItem) return;

    setSubmitting(true);
    try {
      await api.post(`/api/settlement/${selectedItem.id}`, {
        status: modalValues.status,
      });

      fetchData(currentPage, perPage);
      setSelectedItem(null);
      setModalValues({});
    } catch {
      showErrorToast("Gagal mengubah status pelunasan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-theme="light" className="p-6 bg-base-200 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Data Pelunasan</h2>

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
                  <th>Tanggal Pelunasan</th>
                  <th>Nama Karyawan</th>
                  <th>Besar Pinjaman</th>
                  <th>Bukti Transfer</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {dataList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center">
                      Belum ada data pelunasan
                    </td>
                  </tr>
                ) : (
                  dataList.map((item, idx) => (
                    <tr key={item.id}>
                      <th>{(currentPage - 1) * perPage + idx + 1}</th>
                      <td>{item.settlement_date}</td>
                      <td>{item.user?.name}</td>
                      <td>{item.amount}</td>
                      <td>
                        {item.proof_path ? (
                          <a
                            href={`${process.env.REACT_APP_API_URL}/storage/${item.proof_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link link-primary"
                          >
                            Lihat
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td>{item.status}</td>
                      <td>
                        {item.status === "applied" && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              setSelectedItem(item);
                              setModalValues({ status: "" });
                            }}
                          >
                            Action
                          </button>
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

      {/* Modal */}
      {selectedItem && (
        <ModalForm
          title={`Action Pelunasan - ${selectedItem.user?.name}`}
          inputs={modalInputs}
          values={modalValues}
          setValues={setModalValues}
          onSubmit={handleSubmitModal}
          submitting={submitting}
          onClose={() => {
            setSelectedItem(null);
            setModalValues({});
          }}
        />
      )}
    </div>
  );
}
