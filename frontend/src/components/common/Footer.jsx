import { Link } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import Logo from "@/components/common/Logo";

const cols = [
  { title: "Buy", links: [[PATHS.lands, "All lands"], [`${PATHS.lands}?district=Kathmandu`, "Kathmandu"], [`${PATHS.lands}?district=Lalitpur`, "Lalitpur"], [`${PATHS.lands}?district=Pokhara`, "Pokhara"]] },
  { title: "Sell", links: [[PATHS.register, "Create a seller account"], [PATHS.vendors, "Browse sellers"], [PATHS.login, "Seller login"]] },
  { title: "Tools", links: [[PATHS.converter, "Area converter"]] },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap" style={{ paddingBlock: "2.5rem" }}>
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Logo />
            <p className="text-muted text-sm mt-3" style={{ maxWidth: "20rem" }}>
              A marketplace where owners and agencies list land, and buyers see the plot, the road and the papers before they call.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h3 style={{ fontSize: "1rem" }}>{c.title}</h3>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-muted" style={{ listStyle: "none", padding: 0, margin: "0.75rem 0 0" }}>
                {c.links.map(([to, label]) => (
                  <li key={label}>
                    <Link to={to}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-muted text-sm mt-8">
          &copy; {new Date().getFullYear()} LandMarket. Listings are shared by owners and agencies; check documents before you pay.
        </p>
      </div>
    </footer>
  );
}
