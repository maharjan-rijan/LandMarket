import { useState } from "react";
import { useData } from "@/store/DataContext";
import { formatDate } from "@/lib/format";
import { ROLES, ROLE_LABELS, ROLE_TONES } from "@/lib/roles";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/land/StatusBadge";

const ROLE_FILTERS = [
  "all",
  ROLES.ADMIN,
  ROLES.SELLER,
  ROLES.BUYER,
  ROLES.USER,
];

export default function AdminUsers() {
  const { users: everyone, uid, setUserStatus } = useData();
  // The person looking at this page is not listed: this page is for managing everyone else.
  const users = everyone.filter((u) => String(u.id) !== String(uid));
  const [role, setRole] = useState("all");
  const [q, setQ] = useState("");

  const term = q.trim().toLowerCase();
  const shown = users.filter(
    (u) =>
      (role === "all" || u.role === role) &&
      (!term || `${u.name} ${u.email}`.toLowerCase().includes(term)),
  );
  const count = (r) =>
    r === "all" ? users.length : users.filter((u) => u.role === r).length;

  return (
    <>
      <PageHeader
        title="Users"
        text="Everyone else with an account. Your own account is not listed. Suspended people cannot log in."
      />

      <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by role"
        >
          {ROLE_FILTERS.map((r) => (
            <button
              key={r}
              type="button"
              className={`chip${role === r ? " is-on" : ""}`}
              aria-pressed={role === r}
              onClick={() => setRole(r)}
            >
              {r === "all" ? "Everyone" : ROLE_LABELS[r]}{" "}
              <small className="num">{count(r)}</small>
            </button>
          ))}
        </div>
        <Input
          label="Search"
          name="q"
          type="search"
          placeholder="Name or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full"
          style={{ maxWidth: "18rem" }}
        />
      </div>

      {shown.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium" style={{ minWidth: "10rem" }}>
                    {u.name}
                  </td>
                  <td className="text-muted">{u.email}</td>
                  <td>
                    <Badge tone={ROLE_TONES[u.role] ?? "gray"}>
                      {ROLE_LABELS[u.role] ?? u.role}
                    </Badge>
                  </td>
                  <td className="text-muted" style={{ whiteSpace: "nowrap" }}>
                    {formatDate(u.joinedAt)}
                  </td>
                  <td>
                    <StatusBadge status={u.status} />
                  </td>
                  <td>
                    {u.role === ROLES.ADMIN ? (
                      <span className="text-sm text-muted">
                        Cannot be suspended
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant={
                          u.status === "suspended" ? "outline" : "danger"
                        }
                        onClick={() =>
                          setUserStatus(
                            u.id,
                            u.status === "suspended" ? "active" : "suspended",
                          )
                        }
                      >
                        {u.status === "suspended" ? "Reactivate" : "Suspend"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title={users.length ? "No users match" : "No other users yet"}
          text={
            users.length
              ? "Try another role or search term."
              : "People who register will appear here."
          }
        />
      )}
    </>
  );
}
