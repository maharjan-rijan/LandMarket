import { useData } from "@/store/DataContext";
import Button from "@/components/ui/Button";

export default function SampleNotice() {
  const { hasSample, clearSample } = useData();
  if (!hasSample) return null;

  return (
    <div className="notice" role="status">
      <p>
        You are looking at sample data, stored only in this browser. It will be
        replaced by real records once the API is connected.
      </p>
      <Button variant="outline" size="sm" onClick={clearSample}>
        Clear sample data
      </Button>
    </div>
  );
}
