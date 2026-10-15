import Badge from "@/components/ui/Badge";

const map = {
  active: ["green", "Active"],
  sold: ["river", "Sold"],
  closed: ["gray", "Closed"],
  suspended: ["red", "Suspended"],
  new: ["gold", "New"],
  replied: ["green", "Replied"],
  open: ["green", "Open"],
};

export default function StatusBadge({ status }) {
  const [tone, label] = map[status] ?? ["gray", status];
  return <Badge tone={tone}>{label}</Badge>;
}
