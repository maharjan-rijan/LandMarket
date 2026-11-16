// src/components/ui/LocationSelect.jsx
import { useMemo } from "react";
import data from "@/data/nepal-locations.json";

const base =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm " +
  "focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 " +
  "disabled:bg-gray-100 disabled:text-gray-400";

export default function LocationSelect({ value, onChange, errors = {} }) {
  const { province = "", district = "", municipality = "", ward = "" } = value;

  const provinces = Object.keys(data);
  const districts = useMemo(
    () => (province ? Object.keys(data[province]).sort() : []),
    [province]
  );
  const municipalities = useMemo(
    () => (province && district ? data[province][district] : []),
    [province, district]
  );
  const wardCount = useMemo(
    () => municipalities.find((m) => m.name === municipality)?.wards || 0,
    [municipalities, municipality]
  );

  // changing a parent resets all children
  const set = (patch) => onChange({ province, district, municipality, ward, ...patch });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Province" error={errors.province}>
        <select className={base} value={province}
          onChange={(e) => set({ province: e.target.value, district: "", municipality: "", ward: "" })}>
          <option value="">Select province</option>
          {provinces.map((p) => <option key={p}>{p}</option>)}
        </select>
      </Field>

      <Field label="District" error={errors.district}>
        <select className={base} value={district} disabled={!province}
          onChange={(e) => set({ district: e.target.value, municipality: "", ward: "" })}>
          <option value="">Select district</option>
          {districts.map((d) => <option key={d}>{d}</option>)}
        </select>
      </Field>

      <Field label="Municipality / Rural Municipality" error={errors.municipality}>
        <select className={base} value={municipality} disabled={!district}
          onChange={(e) => set({ municipality: e.target.value, ward: "" })}>
          <option value="">Select municipality</option>
          {municipalities.map((m) => (
            <option key={m.name} value={m.name}>{m.name}</option>
          ))}
        </select>
      </Field>

      <Field label="Ward No." error={errors.ward}>
        <select className={base} value={ward} disabled={!municipality}
          onChange={(e) => set({ ward: e.target.value })}>
          <option value="">Select ward</option>
          {Array.from({ length: wardCount }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>Ward {n}</option>
          ))}
        </select>
      </Field>
    </div>
  );
}

const Field = ({ label, error, children }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
    {children}
    {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
  </label>
);