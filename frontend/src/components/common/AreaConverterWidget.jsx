import { useState } from "react";
import { AREA_UNITS, convertArea } from "@/lib/units";
import Input from "@/components/ui/Input";

const fmt = (n) =>
  n.toLocaleString("en-US", { maximumFractionDigits: n < 10 ? 3 : 2 });

export default function AreaConverterWidget() {
  const [value, setValue] = useState("1");
  const [unit, setUnit] = useState("aana");
  const results = convertArea(value, unit);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Area"
          name="conv-value"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Input
          as="select"
          label="Unit"
          name="conv-unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        >
          {AREA_UNITS.map((u) => (
            <option key={u.key} value={u.key}>
              {u.label}
            </option>
          ))}
        </Input>
      </div>

      <div className="convert-grid" aria-live="polite">
        {results.map((r) => (
          <div
            key={r.key}
            className={`convert-cell${r.key === unit ? " is-source" : ""}`}
          >
            <p>{r.label}</p>
            <p className="num">{fmt(r.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
