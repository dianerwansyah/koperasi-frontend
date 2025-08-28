import React, { useState, useEffect, useCallback } from "react";
import api from "../../api/api";
import { showErrorToast } from "../../components/ToastHelper";
import Pagination from "../../components/Pagination";
import Filter from "../../components/Filter";
import ModalForm from "../../components/ModalForm";
import DynamicHeroIcon from "../../components/DynamicHeroIcon";
import { endOfMonth, format } from "date-fns";

export default function FormDataSimpanan() {
  const [dataList, setDataList] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [modalMode, setModalMode] = useState("add");

  const currentMonth = new Date();
  const currentMonthStr = `${currentMonth.getFullYear()}-${String(
    currentMonth.getMonth() + 1
  ).padStart(2, "0")}`;

  const todayStr = `${currentMonth.getFullYear()}-${String(
    currentMonth.getMonth() + 1
  ).padStart(2, "0")}-${String(currentMonth.getDate()).padStart(2, "0")}`;

  const [filters, setFilters] = useState({
    bulan: currentMonthStr,
    jenis: "",
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [modalValues, setModalValues] = useState({
    user_id: "",
    date: "",
    type: "",
    value: "",
    bagi_hasil: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Filter configuration
  const filterConfig = [
    { key: "date", label: "Bulan", type: "month" },
    {
      key: "type",
      label: "Jenis Simpanan",
      type: "select",
      options: [
        { value: "wajib", label: "Simpanan Wajib" },
        { value: "pokok", label: "Simpanan Pokok" },
      ],
    },
  ];

  // Modal input configuration
  const modalInputs = [
    {
      name: "id",
      type: "hidden",
    },
    {
      name: "user_id",
      label: "Karyawan",
      type: "select",
      required: true,
      options: userOptions,
    },
    {
      name: "date",
      label: "Tanggal",
      type: "date",
      required: true,
    },
    {
      name: "value",
      label: "Besar Simpanan",
      type: "number",
      required: true,
    },
    {
      name: "type",
      label: "Jenis Simpanan",
      type: "select",
      required: true,
      options: [
        { value: "wajib", label: "Simpanan Wajib" },
        { value: "pokok", label: "Simpanan Pokok" },
      ],
    },
    {
      name: "bagi_hasil",
      label: "Total Bagi Hasil Tahunan",
      type: "number",
      required: false,
      readonly: true,
      fetchApi: {
        url: "/api/savings/calculate",
        params: ["id", "user_id", "value", "date", "type"],
        field: "bagi_hasil_tahunan",
        condition: (values) =>
          values.user_id &&
          values.date &&
          values.type === "wajib" &&
          values.value,
      },
    },
  ];

  // Fetch simpanan data
  const fetchData = useCallback(
    async (page = 1, limit = 10) => {
      setLoading(true);
      try {
        const params = { page, limit };

        // konversi filter date ke start & end
        Object.entries(filters).forEach(([key, value]) => {
          if (!value) return;

          if (key === "date") {
            // format "YYYY-MM"
            if (/^\d{4}-\d{2}$/.test(value)) {
              const startDate = `${value}-01`;
              const endDate = format(
                endOfMonth(new Date(startDate)),
                "yyyy-MM-dd"
              );

              params["start_date"] = startDate;
              params["end_date"] = endDate;
            } else {
              // format YYYY-MM-DD
              params[key] = value;
            }
          } else {
            params[key] = value;
          }
        });

        const res = await api.get("/api/savings", { params });
        setDataList(res.data.data);
        setTotal(res.data.total);
        setPerPage(res.data.per_page);
        setCurrentPage(res.data.current_page);
        setLastPage(res.data.last_page);
      } catch {
        showErrorToast("Gagal mengambil data simpanan");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Fetch user list
  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("api/user/getuser");
      const users = res.data.map((u) => ({
        value: String(u.id),
        label: `${u.name} - ${u.email}`,
      }));
      setUserOptions(users);
    } catch {
      showErrorToast("Gagal mengambil data user");
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData(currentPage, perPage);
    fetchUsers();
  }, [fetchData, currentPage, perPage, fetchUsers]);

  // Filter handlers
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };
  const handleResetFilters = () => {
    setFilters({ bulan: "", jenis: "" });
    setCurrentPage(1);
  };

  // Modal submit
  const handleSubmitModal = async () => {
    if (!modalValues) return;

    setSubmitting(true);
    try {
      if (modalMode === "add") {
        await api.post("/api/savings", modalValues);
      } else if (modalMode === "update" && selectedItem) {
        await api.put(`/api/savings/${selectedItem.id}`, modalValues);
      }

      fetchData(currentPage, perPage);
      setSelectedItem(null);
      setModalValues({
        user_id: "",
        date: "",
        type: "",
        value: "",
        bagi_hasil: 0,
      });
      setModalMode("add");
      setIsAdding(false);
    } catch {
      showErrorToast(
        modalMode === "add"
          ? "Gagal menambahkan data simpanan"
          : "Gagal mengubah data simpanan"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete simpanan
  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data simpanan ini?"))
      return;

    try {
      await api.delete(`/api/savings/${id}`);
      fetchData(currentPage, perPage);
    } catch {
      showErrorToast("Gagal menghapus data simpanan");
    }
  };

  // Function untuk set modal values saat edit/detail
  const openModal = (item, mode) => {
    setSelectedItem(item);
    setModalValues({
      id: item.id,
      user_id: item.user ? String(item.user.id) : "",
      type: item.type || "",
      date: item.date || "",
      value: item.value || "",
      bagi_hasil: item.bagi_hasil || 0,
    });
    setModalMode(mode);
    setIsAdding(true);
  };

  return (
    <div data-theme="light" className="p-6 bg-base-200 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Data Simpanan</h2>
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
            {/* Tambah Data */}
            <div className="flex justify-end mb-4 mr-8">
              <button
                className="btn btn-primary btn-l"
                onClick={() => {
                  setIsAdding(true);
                  setSelectedItem(null);
                  setModalValues({
                    user_id: "",
                    date: todayStr,
                    type: "",
                    value: "",
                    bagi_hasil: 0,
                  });
                  setModalMode("add");
                }}
              >
                Tambah Data
              </button>
            </div>

            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Karyawan</th>
                  <th>Bulan</th>
                  <th>Jenis Simpanan</th>
                  <th>Besar Simpanan</th>
                  <th>Bagi Hasil</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {dataList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center">
                      Belum ada data simpanan
                    </td>
                  </tr>
                ) : (
                  dataList.map((item, idx) => (
                    <tr key={item.id}>
                      <th>{(currentPage - 1) * perPage + idx + 1}</th>
                      <td>{item.user?.name}</td>
                      <td>{item.date}</td>
                      <td>{item.type}</td>
                      <td>{item.value}</td>
                      <td>{item.bagi_hasil}</td>
                      <td>
                        <div className="dropdown">
                          <button
                            tabIndex={0}
                            className="btn btn-sm btn-square btn-ghost"
                          >
                            <DynamicHeroIcon
                              name="EllipsisHorizontalIcon"
                              className="w-5 h-5"
                            />
                          </button>
                          <ul
                            tabIndex={0}
                            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40"
                          >
                            <li>
                              <button onClick={() => openModal(item, "detail")}>
                                Detail
                              </button>
                            </li>
                            <li>
                              <button onClick={() => openModal(item, "update")}>
                                Update
                              </button>
                            </li>
                            <li>
                              <button
                                className="text-red-500"
                                onClick={() => handleDelete(item.id)}
                              >
                                Delete
                              </button>
                            </li>
                          </ul>
                        </div>
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
      {(selectedItem || isAdding) && (
        <ModalForm
          title={
            modalMode === "add"
              ? "Tambah Simpanan"
              : modalMode === "update"
              ? `Update Simpanan - ${selectedItem.type} - ${selectedItem.date}`
              : `Detail Simpanan - ${selectedItem.type} - ${selectedItem.date}`
          }
          inputs={modalInputs}
          values={modalValues}
          setValues={setModalValues}
          onSubmit={handleSubmitModal}
          submitting={submitting}
          modalMode={modalMode}
          onClose={() => {
            setSelectedItem(null);
            setModalValues({
              user_id: "",
              date: "",
              type: "",
              value: "",
              bagi_hasil: 0,
            });
            setIsAdding(false);
            setModalMode("add");
          }}
        />
      )}
    </div>
  );
}
