import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/store/DataContext";
import { ROLES } from "@/lib/roles";
import { PATHS } from "@/routes/paths";
import Button from "@/components/ui/Button";
import { HeartIcon, HeartSolidIcon } from "@/hooks/icons";

export default function SaveButton({ landId, variant = "icon" }) {
  const { user } = useAuth();
  const { savedIds, toggleSaved } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  // Only buyers save land
  if (user && user.role !== ROLES.BUYER) return null;

  const saved = savedIds.includes(landId);
  const Icon = saved ? HeartSolidIcon : HeartIcon;

  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate(PATHS.login, { state: { from: location } });
      return;
    }
    toggleSaved(landId);
  };

  if (variant === "button") {
    return (
      <Button variant="outline" onClick={onClick} aria-pressed={saved}>
        <Icon size={18} /> {saved ? "Saved" : "Save land"}
      </Button>
    );
  }

  return (
    <Button
      variant="icon"
      className={`plot-save${saved ? " is-saved" : ""}`}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved lands" : "Save this land"}
      onClick={onClick}
    >
      <Icon size={20} />
    </Button>
  );
}
