import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useData } from "@/store/DataContext";
import { DISTRICTS } from "@/data/districts";
import { formatNprShort, timeAgo, totalPrice } from "@/lib/format";
import { makeActivity } from "@/lib/activity";
import { ROLES, ROLE_LABELS } from "@/lib/roles";
import { PATHS } from "@/routes/paths";
import ActivityChart from "@/components/dashboard/ActivityChart";
import BarList from "@/components/dashboard/BarList";
import StatStrip from "@/components/dashboard/StatStrip";
import PageHeader from "@/components/common/PageHeader";

const STATUSES = [
  ["active", "Active", "var(--terrace)"],
  ["sold", "Sold", "var(--river)"],
  ["closed", "Closed", "var(--line-strong)"],
];

export default function AdminOverview() {
  const { lands, vendors, users, inquiries, demands, summary, getVendor } = useData();

  const count = (s) => lands.filter((l) => l.status === s).length;
  const totalViews = lands.reduce((s, l) => s + l.views, 0);
  const activity = useMemo(() => makeActivity(totalViews, "platform"), [totalViews]);
  const newest = useMemo(() => [...lands].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5), [lands]);

  const inquiryCount = summary?.inquiries ?? inquiries.length;
  const openDemands = summary?.open_demands ?? demands.filter((d) => d.status === "open").length;

  const stats = [
    { label: "Users", value: users.length },
    { label: "Sellers", value: vendors.length },
    { label: "Active listings", value: count("active") },
    { label: "Inquiries", value: inquiryCount, hint: `${openDemands} open ${openDemands === 1 ? "demand" : "demands"}` },
  ];

  const roles = [ROLES.SELLER, ROLES.BUYER, ROLES.USER, ROLES.ADMIN].map((r) => ({
    label: ROLE_LABELS[r],
    value: users.filter((u) => u.role === r).length,
  }));

  return (
    <>
      <PageHeader title="Admin overview" text="How the marketplace is doing." />

      <div className="flex flex-col gap-6">
        <StatStrip items={stats} />

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="sheet sheet-pad" aria-labelledby="new-h">
            <div className="flex items-center justify-between gap-2">
              <h2 id="new-h" style={{ fontSize: "1.2rem" }}>Newest listings</h2>
              <Link to={PATHS.admin.listings} className="link text-sm">Manage listings</Link>
            </div>
            {newest.length ? (
              <ul className="mt-3" style={{ listStyle: "none", padding: 0, margin: "0.75rem 0 0" }}>
                {newest.map((l) => (
                  <li key={l.id} className="flex items-start justify-between gap-3" style={{ padding: ".7rem 0", borderTop: "1px solid var(--line)" }}>
                    <div className="min-w-0">
                      <Link to={PATHS.land(l.id)} className="font-medium truncate block">{l.title}</Link>
                      <p className="text-sm text-muted truncate">{getVendor(l.vendorId)?.name ?? "Unknown seller"}, {timeAgo(l.createdAt)}</p>
                    </div>
                    <p className="text-sm shrink-0 num">{formatNprShort(totalPrice(l))}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted text-sm mt-3">No listings yet.</p>
            )}
          </section>

          <section className="sheet sheet-pad" aria-labelledby="roles-h">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 id="roles-h" style={{ fontSize: "1.2rem" }}>People by role</h2>
              <Link to={PATHS.admin.users} className="link text-sm">All users</Link>
            </div>
            <BarList items={roles} />
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="sheet sheet-pad" aria-labelledby="stat-h">
            <h2 id="stat-h" style={{ fontSize: "1.2rem" }} className="mb-4">Listings by status</h2>
            <BarList items={STATUSES.map(([key, label, color]) => ({ label, value: count(key), color }))} />
          </section>

          <section className="sheet sheet-pad" aria-labelledby="dist-h">
            <h2 id="dist-h" style={{ fontSize: "1.2rem" }} className="mb-4">Active listings by district</h2>
            <BarList items={DISTRICTS.map((d) => ({ label: d, value: lands.filter((l) => l.status === "active" && l.district === d).length }))} />
          </section>
        </div>

        <section className="sheet sheet-pad" aria-labelledby="traf-h">
          <h2 id="traf-h" style={{ fontSize: "1.2rem" }} className="mb-3">Traffic</h2>
          <ActivityChart data={activity} label="Views across all listings" />
        </section>
      </div>
    </>
  );
}
