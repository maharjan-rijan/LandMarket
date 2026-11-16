import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/store/DataContext";
import { DOCUMENTS, FACINGS } from "@/data/districts";
import {
  PROVINCES,
  districtsOf,
  municipalitiesOf,
  wardsOf,
} from "@/data/locations";
import { formatArea, formatNpr } from "@/lib/format";
import { sqftOf } from "@/lib/units";
import { PATHS } from "@/routes/paths";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/common/PageHeader";
import PlotShape from "@/components/land/PlotShape";

const empty = {
  title: "",
  province: "",
  district: "",
  municipality: "",
  ward: "",
  tole: "",
  areaAana: "",
  pricePerAana: "",
  roadFt: "13",
  facing: "East",
  description: "",
  documents: ["Lalpurja"],
};

export default function AddListing() {
  const { createLand } = useData();
  const navigate = useNavigate();
  const [v, setV] = useState(empty);
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setV((p) => ({ ...p, [k]: e.target.value }));

  // Each level resets everything below it.
  const setProvince = (e) =>
    setV((p) => ({
      ...p,
      province: e.target.value,
      district: "",
      municipality: "",
      ward: "",
    }));
  const setDistrict = (e) =>
    setV((p) => ({
      ...p,
      district: e.target.value,
      municipality: "",
      ward: "",
    }));
  const setMunicipality = (e) =>
    setV((p) => ({ ...p, municipality: e.target.value, ward: "" }));

  const toggleDoc = (d) =>
    setV((p) => ({
      ...p,
      documents: p.documents.includes(d)
        ? p.documents.filter((x) => x !== d)
        : [...p.documents, d],
    }));

  const districts = districtsOf(v.province);
  const municipalities = municipalitiesOf(v.province, v.district);
  const wardCount = wardsOf(v.province, v.district, v.municipality);

  const area = Number(v.areaAana);
  const price = Number(v.pricePerAana);
  const total = area > 0 && price > 0 ? Math.round(area * price) : 0;

  const validate = () => {
    const e = {};
    if (v.title.trim().length < 5)
      e.title = "Give the listing a title of at least 5 characters.";
    if (!v.province) e.province = "Select a province.";
    if (!v.district) e.district = "Select a district.";
    if (!v.municipality) e.municipality = "Select a municipality.";
    if (!(Number(v.ward) >= 1 && Number(v.ward) <= wardCount))
      e.ward = wardCount
        ? `Select a ward from 1 to ${wardCount}.`
        : "Select a municipality first.";
    if (!(area > 0)) e.areaAana = "Enter the area in aana, for example 4.5.";
    if (!(price > 0)) e.pricePerAana = "Enter the price per aana in rupees.";
    if (!(Number(v.roadFt) >= 4)) e.roadFt = "Enter the road width in feet.";
    if (!v.documents.includes("Lalpurja"))
      e.documents = "A lalpurja is required for every listing.";
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      // bring the first problem into view
      document
        .querySelector("[aria-invalid='true']")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const land = await createLand({
      title: v.title.trim(),
      province: v.province,
      district: v.district,
      municipality: v.municipality,
      ward: Number(v.ward),
      tole: v.tole.trim(),
      areaAana: area,
      pricePerAana: price,
      roadFt: Number(v.roadFt),
      facing: v.facing,
      documents: v.documents,
      description: v.description.trim(),
    });
    if (land) navigate(PATHS.seller.listings);
  };

  const placeLine = [
    v.municipality && (v.ward ? `${v.municipality}-${v.ward}` : v.municipality),
    v.district,
    v.province,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <PageHeader
        title="Add a listing"
        text="Your listing goes live as soon as you publish it."
      />

      <form
        onSubmit={submit}
        noValidate
        className="grid gap-6 xl:grid-cols-[1fr_20rem] xl:items-start"
      >
        <div className="sheet sheet-pad flex flex-col gap-5">
          <Input
            label="Title"
            name="title"
            value={v.title}
            onChange={set("title")}
            error={errors.title}
            placeholder="For example: 5 aana corner plot near the ring road"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              as="select"
              label="Province"
              name="province"
              value={v.province}
              onChange={setProvince}
              error={errors.province}
            >
              <option value="">Select province</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Input>
            <Input
              as="select"
              label="District"
              name="district"
              value={v.district}
              onChange={setDistrict}
              disabled={!v.province}
              error={errors.district}
            >
              <option value="">Select district</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Input>
            <Input
              as="select"
              label="Municipality / Rural municipality"
              name="municipality"
              value={v.municipality}
              onChange={setMunicipality}
              disabled={!v.district}
              error={errors.municipality}
            >
              <option value="">Select municipality</option>
              {municipalities.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </Input>
            <Input
              as="select"
              label="Ward no."
              name="ward"
              value={v.ward}
              onChange={set("ward")}
              disabled={!v.municipality}
              error={errors.ward}
              hint={
                wardCount
                  ? `${wardCount} wards in this municipality.`
                  : undefined
              }
            >
              <option value="">Select ward</option>
              {Array.from({ length: wardCount }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Ward {n}
                </option>
              ))}
            </Input>
          </div>
          <Input
            label="Tole / landmark (optional)"
            name="tole"
            value={v.tole}
            onChange={set("tole")}
            placeholder="For example: near the temple, behind the school"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Area (aana)"
              name="areaAana"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={v.areaAana}
              onChange={set("areaAana")}
              error={errors.areaAana}
              hint={
                area > 0
                  ? `${formatArea(area)}, ${sqftOf(area).toLocaleString()} sq ft`
                  : "1 ropani is 16 aana."
              }
            />
            <Input
              label="Price per aana (NPR)"
              name="pricePerAana"
              type="number"
              min="0"
              step="any"
              inputMode="numeric"
              value={v.pricePerAana}
              onChange={set("pricePerAana")}
              error={errors.pricePerAana}
              hint={price > 0 ? formatNpr(price) : undefined}
            />
            <Input
              label="Road width (ft)"
              name="roadFt"
              type="number"
              min="4"
              value={v.roadFt}
              onChange={set("roadFt")}
              error={errors.roadFt}
            />
            <Input
              as="select"
              label="Facing"
              name="facing"
              value={v.facing}
              onChange={set("facing")}
            >
              {FACINGS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </Input>
          </div>

          <Input
            as="textarea"
            label="About this land"
            name="description"
            value={v.description}
            onChange={set("description")}
            hint="Soil, slope, water, electricity, nearby landmarks."
          />

          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="sr-only">Documents you hold</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {DOCUMENTS.map((d) => (
                <Input
                  key={d}
                  type="checkbox"
                  name={`doc-${d}`}
                  label={d}
                  checked={v.documents.includes(d)}
                  onChange={() => toggleDoc(d)}
                />
              ))}
            </div>
            {errors.documents ? (
              <p className="error-text">{errors.documents}</p>
            ) : (
              <p className="hint">
                File upload comes with the backend. For now, only the document
                names are recorded.
              </p>
            )}
          </fieldset>

          <div className="flex gap-3">
            <Button type="submit">Publish listing</Button>
            <Button to={PATHS.seller.listings} variant="ghost">
              Cancel
            </Button>
          </div>
        </div>

        <aside
          className="sheet"
          style={{ overflow: "hidden" }}
          aria-label="Live preview"
        >
          <div className="plot-sheet">
            <PlotShape
              seed="preview"
              areaAana={area > 0 ? area : 4}
              roadFt={Number(v.roadFt) || 13}
            />
          </div>
          <div className="sheet-pad">
            <p className="font-semibold">{v.title || "Your listing title"}</p>
            <p className="text-sm text-muted">
              {v.tole && `${v.tole}, `}
              {v.municipality}
              {v.ward ? `-${v.ward}` : ""}, {v.district}
            </p>
            <p className="price num mt-3">
              {area > 0 && price > 0
                ? formatNpr(Math.round(area * price))
                : "रु. 0"}
            </p>
            <p className="text-sm text-muted">
              Total price, calculated from area and price per aana.
            </p>
          </div>
        </aside>
      </form>
    </>
  );
}
