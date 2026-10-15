import { PATHS } from "@/routes/paths";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section
      className="wrap"
      style={{ paddingBlock: "6rem", textAlign: "center" }}
    >
      <h1 className="page-title">This plot is not on the map</h1>
      <p className="text-muted mt-2">
        The page you are looking for does not exist, or the listing was removed.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button to={PATHS.home}>Back to home</Button>
        <Button to={PATHS.lands} variant="outline">
          Browse lands
        </Button>
      </div>
    </section>
  );
}
