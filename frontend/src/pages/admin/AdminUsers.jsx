import { useState } from "react";
import { useData } from "@/store/DataContext";
import { formatDate } from "@/lib/format";
import { ROLES, ROLE_LABELS, ROLE_TONES } from "@/lib/roles";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ChipGroup from "@/components/ui/ChipGroup";
import Input from "@/components/ui/Input";
import { SearchIcon } from "@/hooks/icons";
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
      <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
        <ChipGroup
          label="Filter by role"
          className="md:flex-1"
          options={ROLE_FILTERS.map((r) => ({
            value: r,
            label: r === "all" ? "Everyone" : ROLE_LABELS[r],
            count: count(r),
          }))}
          value={role}
          onChange={setRole}
        />
        <Input
          name="q"
          label="Search users"
          hideLabel
          type="search"
          icon={<SearchIcon size={19} />}
          onClear={() => setQ("")}
          placeholder="Name or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
          className="w-full md:w-72 md:shrink-0"
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
                  <td style={{ minWidth: "12rem" }}>
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatarUrl} name={u.name} size={32} />
                      <span className="font-medium">{u.name}</span>
                    </div>
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
