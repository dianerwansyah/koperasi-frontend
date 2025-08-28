import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";

export default function Filter({
  filters = [],
  values = {},
  onApply,
  onReset,
}) {
  const [tempValues, setTempValues] = useState(() => ({ ...values }));
  const [show, setShow] = useState(true);

  useEffect(() => {
    setTempValues({ ...values });
  }, [values]);

  const handleChange = (key, val) => {
    setTempValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleApply = () => {
    onApply && onApply({ ...tempValues });
  };

  const handleReset = () => {
    const empty = {};
    filters.forEach((f) => (empty[f.key] = ""));
    setTempValues(empty);
    onReset && onReset();
  };

  const renderInput = (f) => {
    const value = tempValues[f.key] ?? "";

    if (f.type === "text") {
      return (
        <input
          type="text"
          placeholder={f.placeholder || `Cari ${f.label}`}
          value={value}
          onChange={(e) => handleChange(f.key, e.target.value)}
          className="input input-bordered"
        />
      );
    }

    if (f.type === "date") {
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => handleChange(f.key, e.target.value)}
          className="input input-bordered"
        />
      );
    }

    if (f.type === "month") {
      return (
        <div key={f.key}>
          <DatePicker
            selected={value ? new Date(value + "-01") : null}
            onChange={(date) =>
              handleChange(
                f.key,
                date
                  ? `${date.getFullYear()}-${(date.getMonth() + 1)
                      .toString()
                      .padStart(2, "0")}`
                  : ""
              )
            }
            dateFormat="MM/yyyy"
            showMonthYearPicker
            className="input input-bordered"
            placeholderText="Pilih Bulan"
          />
        </div>
      );
    }

    if (f.type === "number") {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => handleChange(f.key, e.target.value)}
          className="input input-bordered"
        />
      );
    }

    if (f.type === "select") {
      return (
        <select
          value={value}
          onChange={(e) => handleChange(f.key, e.target.value)}
          className="select select-bordered"
        >
          <option value="">{f.selectAllLabel ?? "Semua"}</option>
          {(f.options || []).map((opt) =>
            typeof opt === "string" ? (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ) : (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            )
          )}
        </select>
      );
    }

    return null;
  };

  return (
    <div className="bg-base-100 p-4 rounded shadow-sm mb-4">
      {/* Toggle Show/Hide di sebelah kiri */}
      <div className="mb-3">
        <button
          type="button"
          className="btn btn-sm btn-outline"
          onClick={() => setShow(!show)}
        >
          {show ? "Hide Filter" : "Show Filter"}
        </button>
      </div>

      {show && (
        <div className="flex gap-4 flex-wrap items-end">
          {filters.map((f) => (
            <div key={f.key} className="flex flex-col min-w-[160px]">
              <label className="text-sm text-gray-700 mb-1 font-medium">
                {f.label}
              </label>
              {renderInput(f)}
            </div>
          ))}

          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
            >
              Reset
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleApply}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
