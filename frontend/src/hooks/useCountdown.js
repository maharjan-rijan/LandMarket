import { useEffect, useState } from "react";

// Counts down from a number of seconds to 0, for example the "Resend in 42s" button.
// const [left, setLeft] = useCountdown();  setLeft(60) starts it.
export default function useCountdown() {
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (left <= 0) return undefined;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  return [left, setLeft];
}
