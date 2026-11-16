import data from "./nepal-locations.json";

export const PROVINCES = Object.keys(data);

export const districtsOf = (province) =>
  province && data[province] ? Object.keys(data[province]).sort() : [];

export const municipalitiesOf = (province, district) =>
  province && district ? (data[province]?.[district] ?? []) : [];

export const wardsOf = (province, district, municipality) =>
  municipalitiesOf(province, district).find((m) => m.name === municipality)
    ?.wards ?? 0;
