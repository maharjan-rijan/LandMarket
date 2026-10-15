import { useData } from "@/store/DataContext";
import { PATHS } from "@/routes/paths";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import LandCard from "@/components/land/LandCard";

export default function BuyerSaved() {
  const { savedIds, getLand } = useData();
  const saved = savedIds.map(getLand).filter(Boolean);

  return (
    <>
      <PageHeader title="Saved lands" text="Plots you want to come back to." />
      {saved.length ? (
        <div className="land-grid">
          {saved.map((l) => (
            <LandCard key={l.id} land={l} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nothing saved yet"
          text="Tap the heart on any plot to keep it here."
          action={<Button to={PATHS.lands}>Browse lands</Button>}
        />
      )}
    </>
  );
}
