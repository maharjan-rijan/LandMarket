import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/store/DataContext";
import { DISTRICTS } from "@/data/districts";
import { formatArea, formatNpr, timeAgo } from "@/lib/format";
import { matchesDemand } from "@/lib/landFilters";
import { PATHS } from "@/routes/paths";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/land/StatusBadge";

const BUDGETS = [1000000, 2000000, 3000000, 4000000, 6000000, 10000000];

export default function BuyerDemands() {
  const { user } = useAuth();
  const { uid, demands, lands, addDemand, setDemandStatus } = useData();
  const [v, setV] = useState({
    district: "Kathmandu",
    minAana: "",
    maxPricePerAana: "3000000",
    phone: user?.phone || "",
    note: "",
  });
  const [errors, setErrors] = useState({});

  const mine = demands
    .filter((d) => d.buyerId === uid)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const set = (k) => (e) => setV((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!(Number(v.minAana) > 0))
      er.minAana = "Enter the smallest size you would accept, in aana.";
    setErrors(er);
    if (Object.keys(er).length) return;
    const posted = await addDemand({
      district: v.district,
      minAana: Number(v.minAana),
      maxPricePerAana: Number(v.maxPricePerAana),
      phone: v.phone.trim(),
      note: v.note.trim(),
    });
    if (posted) setV((p) => ({ ...p, minAana: "", note: "" }));
  };

  return (
    <>
      <PageHeader
        title="My demands"
        text="Tell sellers what you want. Those with matching land can contact you."
      />

      <div className="grid gap-6 xl:grid-cols-[22rem_1fr] xl:items-start">
        <form
          onSubmit={submit}
          className="sheet sheet-pad flex flex-col gap-4"
          noValidate
        >
          <h2 style={{ fontSize: "1.2rem" }}>Post a demand</h2>
          <Input
            as="select"
            label="Where"
            name="district"
            value={v.district}
            onChange={set("district")}
          >
            {DISTRICTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Input>
          <Input
            label="Minimum size (aana)"
            name="minAana"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={v.minAana}
            onChange={set("minAana")}
            error={errors.minAana}
          />
          <Input
            as="select"
            label="Budget per aana"
            name="maxPricePerAana"
            value={v.maxPricePerAana}
            onChange={set("maxPricePerAana")}
          >
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                Up to {formatNpr(b)}
              </option>
            ))}
          </Input>
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={v.phone}
            onChange={set("phone")}
            hint="Shown to sellers so they can call you."
          />
          <Input
            as="textarea"
            label="Notes"
            name="note"
            value={v.note}
            onChange={set("note")}
            placeholder="Road width, facing, what the land is for"
          />
          <Button type="submit">Post demand</Button>
        </form>

        <section aria-labelledby="my-demands-h">
          <h2 id="my-demands-h" style={{ fontSize: "1.2rem" }} className="mb-3">
            Your demands
          </h2>
          {mine.length ? (
            <ul
              className="flex flex-col gap-4"
              style={{ listStyle: "none", padding: 0, margin: 0 }}
            >
              {mine.map((d) => {
                const n = lands.filter((l) => matchesDemand(l, d)).length;
                const qs = new URLSearchParams({
                  district: d.district,
                  maxPrice: d.maxPricePerAana,
                  minArea: d.minAana,
                });
                return (
                  <li
                    key={d.id}
                    className="sheet sheet-pad flex flex-wrap items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {formatArea(d.minAana)} or more in {d.district}
                      </p>
                      <p className="text-sm text-muted num">
                        Up to {formatNpr(d.maxPricePerAana)} per aana, posted{" "}
                        {timeAgo(d.createdAt)}
                      </p>
                      {d.note && <p className="text-sm mt-1">{d.note}</p>}
                      {d.status === "open" && (
                        <Link
                          to={`${PATHS.lands}?${qs.toString()}`}
                          className="link text-sm mt-2 inline-block"
                        >
                          {n} {n === 1 ? "plot matches" : "plots match"} right
                          now
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        status={d.status === "open" ? "open" : "closed"}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setDemandStatus(
                            d.id,
                            d.status === "open" ? "closed" : "open",
                          )
                        }
                      >
                        {d.status === "open" ? "Close" : "Reopen"}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              title="No demands yet"
              text="Post one and sellers with matching land will see it."
            />
          )}
        </section>
      </div>
    </>
  );
}
