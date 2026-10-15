import { ROLES } from "@/lib/roles";

const options = [
  { value: ROLES.BUYER, title: "Buy land", hint: "Search, save and inquire" },
  { value: ROLES.SELLER, title: "Sell land", hint: "Open a store and list plots" },
  { value: ROLES.USER, title: "Just looking", hint: "Choose later" },
];

export default function RoleSelector({ value, onChange, error }) {
  return (
    <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
      <legend className="label">I want to</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((o) => (
          <label key={o.value} className={`role-opt${value === o.value ? " is-on" : ""}`}>
            <input
              type="radio"
              name="role"
              value={o.value}
              checked={value === o.value}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
            />
            <span className="block font-semibold">{o.title}</span>
            <span className="block text-sm text-muted">{o.hint}</span>
          </label>
        ))}
      </div>
      {error && <p className="error-text">{error}</p>}
    </fieldset>
  );
}
