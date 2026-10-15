import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/store/DataContext";
import {
  DISTRICTS,
  DOCUMENTS,
  FACINGS,
  MUNICIPALITIES,
} from "@/data/districts";
import { formatArea, formatNpr } from "@/lib/format";
import { sqftOf } from "@/lib/units";
import { PATHS } from "@/routes/paths";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/common/PageHeader";
import PlotShape from "@/components/land/PlotShape";

const empty = {
  title: "",
  district: "Kathmandu",
  municipality: MUNICIPALITIES.Kathmandu[0],
  ward: "",
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

  const setDistrict = (e) => {
    const district = e.target.value;
    setV((p) => ({
      ...p,
      district,
      municipality: MUNICIPALITIES[district][0],
    }));
  };

  const toggleDoc = (d) =>
    setV((p) => ({
      ...p,
      documents: p.documents.includes(d)
        ? p.documents.filter((x) => x !== d)
        : [...p.documents, d],
    }));

  const area = Number(v.areaAana);
  const price = Number(v.pricePerAana);

  const validate = () => {
    const e = {};
    if (v.title.trim().length < 5)
      e.title = "Give the listing a title of at least 5 characters.";
    if (!(Number(v.ward) >= 1 && Number(v.ward) <= 35))
      e.ward = "Enter a ward number from 1 to 35.";
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
    if (Object.keys(e).length) return;

    const land = await createLand({
      title: v.title.trim(),
      district: v.district,
      municipality: v.municipality,
      ward: Number(v.ward),
      areaAana: area,
      pricePerAana: price,
      roadFt: Number(v.roadFt),
      facing: v.facing,
      description: v.description.trim(),
      documents: v.documents,
    });
    if (land) navigate(PATHS.seller.listings);
  };

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

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              as="select"
              label="District"
              name="district"
              value={v.district}
              onChange={setDistrict}
            >
              {DISTRICTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Input>
            <Input
              as="select"
              label="Municipality"
              name="municipality"
              value={v.municipality}
              onChange={set("municipality")}
            >
              {MUNICIPALITIES[v.district].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </Input>
            <Input
              label="Ward no."
              name="ward"
              type="number"
              min="1"
              max="35"
              value={v.ward}
              onChange={set("ward")}
              error={errors.ward}
            />
          </div>

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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
            label="Description"
            name="description"
            value={v.description}
            onChange={set("description")}
            hint="Soil, slope, water, electricity, nearby landmarks."
          />

          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="label">Documents you hold</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {DOCUMENTS.map((d) => (
                <label key={d} className="check">
                  <input
                    type="checkbox"
                    checked={v.documents.includes(d)}
                    onChange={() => toggleDoc(d)}
                  />
                  {d}
                </label>
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
