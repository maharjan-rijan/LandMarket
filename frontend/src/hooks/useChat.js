import { useCallback, useEffect, useRef, useState } from "react";
import { askAssistant } from "@/lib/chat";
import { getErrors } from "@/lib/api";

const KEY = "landmarket-chat";
const GREETING = {
  role: "assistant",
  content: "Namaste! I can help you find land, explain how LandMarket works, or answer land buying questions.",
};

const load = () => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch {
    /* storage can be blocked: start fresh */
  }
  return [GREETING];
};

// Chat state for the widget. The conversation is kept for the browser tab only.
export default function useChat() {
  const [messages, setMessages] = useState(load);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      /* ignore */
    }
  }, [messages]);

  const send = useCallback(
    async (text) => {
      const content = text.trim();
      if (!content || busy.current) return;
      busy.current = true;
      setError("");
      setSending(true);

      const next = [...messages, { role: "user", content }];
      setMessages(next);
      try {
        // The greeting is ours, not part of what Claude needs; it must start with the person.
        const history = next.slice(1).slice(-12);
        const { reply, lands } = await askAssistant(history);
        setMessages((m) => [...m, { role: "assistant", content: reply, lands }]);
      } catch (err) {
        setError(getErrors(err).message);
      } finally {
        busy.current = false;
        setSending(false);
      }
    },
    [messages],
  );

  const reset = useCallback(() => {
    setMessages([GREETING]);
    setError("");
  }, []);

  return { messages, sending, error, send, reset };
}
