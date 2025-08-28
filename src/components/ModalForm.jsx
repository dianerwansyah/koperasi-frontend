import React, { useState, useEffect } from "react";
import api from "../api/api";

export default function ModalForm({
  title,
  inputs = [],
  values,
  setValues,
  onSubmit,
  submitting,
  onClose,
  modalMode = "add",
}) {
  const [errors, setErrors] = useState({});
  const [dynamicData, setDynamicData] = useState({});

  useEffect(() => {
    const fetchDynamicData = async () => {
      for (const input of inputs) {
        if (input.fetchApi && input.fetchApi.condition(values)) {
          try {
            const queryParams = input.fetchApi.params.reduce((acc, param) => {
              acc[param] = values[param];
              return acc;
            }, {});

            const res = await api.get(input.fetchApi.url, {
              params: queryParams,
            });

            setDynamicData((prev) => ({
              ...prev,
              [input.name]: res.data[input.fetchApi.field] ?? "",
            }));
          } catch (err) {
            setDynamicData((prev) => ({ ...prev, [input.name]: "" }));
          }
        } else {
          setDynamicData((prev) => ({ ...prev, [input.name]: 0 }));
        }
      }
    };

    fetchDynamicData();
  }, [inputs, values]);

  const handleChange = (name, value) => {
    if (modalMode === "detail") return;
    setValues({ ...values, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = () => {
    if (modalMode === "detail") return;

    const newErrors = {};
    inputs.forEach((input) => {
      const isRequired =
        input.required || (input.requiredIf && input.requiredIf(values));

      if (isRequired && !values[input.name]) {
        newErrors[input.name] = `${input.label} wajib diisi`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit();
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-lg mb-4">{title}</h3>

        <div className="space-y-4">
          {inputs.map((input) => {
            if (input.requiredIf && !input.requiredIf(values)) return null;

            const errorMsg = errors[input.name];
            const inputValue =
              input.readonly && dynamicData[input.name] !== undefined
                ? dynamicData[input.name]
                : values[input.name] || "";

            const isDisabled = modalMode === "detail" || input.readonly;

            switch (input.type) {
              case "text":
              case "number":
              case "date":
                return (
                  <div key={input.name}>
                    <label className="label">
                      <span className="label-text">
                        {input.label}{" "}
                        {(input.required || input.requiredIf) && (
                          <span className="text-red-500">*</span>
                        )}
                      </span>
                    </label>
                    <input
                      type={input.type}
                      className="input input-bordered w-full"
                      value={inputValue}
                      onChange={(e) => handleChange(input.name, e.target.value)}
                      readOnly={isDisabled}
                    />
                    {errorMsg && (
                      <p className="text-red-500 text-sm mt-1">{errorMsg}</p>
                    )}
                  </div>
                );
              case "select":
                return (
                  <div key={input.name}>
                    <label className="label">
                      <span className="label-text">
                        {input.label}{" "}
                        {(input.required || input.requiredIf) && (
                          <span className="text-red-500">*</span>
                        )}
                      </span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={String(values[input.name] ?? "")}
                      onChange={(e) => handleChange(input.name, e.target.value)}
                      disabled={modalMode === "detail"}
                    >
                      <option value="">Pilih {input.label}</option>
                      {input.options?.map((opt) => (
                        <option key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {errors[input.name] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[input.name]}
                      </p>
                    )}
                  </div>
                );

              default:
                return null;
            }
          })}
        </div>

        <div className="modal-action mt-4">
          <button
            className={`btn ${
              modalMode === "detail" ? "btn-error" : "btn-ghost"
            }`}
            onClick={onClose}
          >
            {modalMode === "detail" ? "Closed" : "Batal"}
          </button>
          {modalMode !== "detail" && (
            <button
              className={`btn btn-primary ${submitting ? "loading" : ""}`}
              disabled={submitting}
              onClick={handleSubmit}
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
