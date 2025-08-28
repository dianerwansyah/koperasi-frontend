import React, { useState } from "react";
import { useSelector } from "react-redux";
import api from "../../api/api";
import { showErrorToast, showSuccessToast } from "../../components/ToastHelper";

export default function PagePengajuanPinjaman() {
  const user = useSelector((state) => state.auth.user);

  const [form, setForm] = useState({
    apply_date: "",
    nama: user?.name || "",
    amount: "",
    phone: "",
    address: "",
  });

  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const theme = "light";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    const err = {};
    if (!form.apply_date) err.apply_date = "Wajib diisi";
    if (!form.amount) err.amount = "Wajib diisi";
    if (!form.phone) err.phone = "Wajib diisi";
    if (!form.address) err.address = "Wajib diisi";
    if (Object.keys(err).length) return setError(err);

    setLoading(true);
    try {
      await api.post("/api/loans", form);
      showSuccessToast("Pengajuan pinjaman berhasil");
      setForm({
        apply_date: "",
        nama: user?.name || "",
        amount: "",
        phone: "",
        address: "",
      });
    } catch (error) {
      showErrorToast("Gagal mengajukan pinjaman");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-theme={theme}
      className="bg-base-200 pt-10 flex flex-col items-center box-border"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md max-w-md w-full space-y-5"
      >
        <h3 className="text-xl font-bold text-center mb-4">
          Form Pengajuan Pinjaman
        </h3>

        {/* Form fields */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Tanggal Pengajuan</span>
          </label>
          <input
            type="date"
            name="apply_date"
            className={`input input-bordered w-full ${
              error.apply_date ? "input-error" : ""
            }`}
            value={form.apply_date}
            onChange={handleChange}
          />
          {error.apply_date && (
            <span className="text-xs text-red-600 mt-1">
              {error.apply_date}
            </span>
          )}
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Nama Karyawan</span>
          </label>
          <input
            type="text"
            name="nama"
            value={form.nama}
            readOnly
            className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Besar Pinjaman (Rp)</span>
          </label>
          <input
            type="number"
            name="amount"
            className={`input input-bordered w-full ${
              error.amount ? "input-error" : ""
            }`}
            value={form.amount}
            onChange={handleChange}
            min={100000}
            step={1000}
          />
          {error.amount && (
            <span className="text-xs text-red-600 mt-1">{error.amount}</span>
          )}
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">No Telepon</span>
          </label>
          <input
            type="tel"
            name="phone"
            className={`input input-bordered w-full ${
              error.phone ? "input-error" : ""
            }`}
            value={form.phone}
            onChange={handleChange}
          />
          {error.phone && (
            <span className="text-xs text-red-600 mt-1">{error.phone}</span>
          )}
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Alamat</span>
          </label>
          <textarea
            name="address"
            className={`textarea textarea-bordered w-full ${
              error.address ? "textarea-error" : ""
            }`}
            value={form.address}
            onChange={handleChange}
            rows={3}
          />
          {error.address && (
            <span className="text-xs text-red-600 mt-1">{error.address}</span>
          )}
        </div>

        <div className="form-control w-full mt-2">
          <button
            type="submit"
            className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Processing..." : "Ajukan Pinjaman"}
          </button>
        </div>
      </form>
    </div>
  );
}
