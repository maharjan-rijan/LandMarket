import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import useChat from "@/hooks/useChat";
import { formatArea, formatNprShort, totalPrice } from "@/lib/format";
import { PATHS } from "@/routes/paths";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ChatIcon, CloseIcon, SendIcon } from "@/hooks/icons";

const SUGGESTIONS = [
  "Find land in Lalitpur under 30 lakh per aana",
  "How do I verify my email?",
  "What documents do I check before buying?",
];

function LandMini({ land }) {
  return (
    <Link to={PATHS.land(land.id)} className="chat-land">
      <strong>{land.title}</strong>
      <span className="text-sm text-muted">
        {land.municipality}, {land.district}
      </span>
      <span className="text-sm num">
        {formatArea(land.areaAana)} · {formatNprShort(totalPrice(land))}
      </span>
    </Link>
  );
}

// Floating assistant. Mount it once per layout.
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const { messages, sending, error, send, reset } = useChat();
  const endRef = useRef(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: "end" });
  }, [open, messages, sending]);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    send(text);
    setText("");
  };

  return (
    <div className="chat">
      {open && (
        <section className="chat-panel" aria-label="LandMarket assistant">
          <header className="chat-head">
            <div>
              <p className="font-semibold">LandMarket assistant</p>
              <p className="text-xs text-muted">AI answers can be wrong. Check important details.</p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={reset}>
                New chat
              </Button>
              <Button variant="icon" aria-label="Close assistant" onClick={() => setOpen(false)}>
                <CloseIcon size={18} />
              </Button>
            </div>
          </header>

          <div className="chat-log" role="log" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`chat-row ${m.role}`}>
                <p className="chat-bubble">{m.content}</p>
                {m.lands?.length > 0 && (
                  <div className="chat-lands">
                    {m.lands.map((l) => (
                      <LandMini key={l.id} land={l} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-col gap-2 items-start">
                {SUGGESTIONS.map((s) => (
                  <Button key={s} variant="chip" onClick={() => send(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            )}

            {sending && (
              <div className="chat-row assistant">
                <p className="chat-bubble text-muted">Typing...</p>
              </div>
            )}
            {error && (
              <p className="text-sm" role="alert" style={{ color: "var(--danger, #b3261e)" }}>
                {error}
              </p>
            )}
            <div ref={endRef} />
          </div>

          <form className="chat-form" onSubmit={submit}>
            <Input
              name="chat-message"
              label="Message"
              hideLabel
              type="text"
              placeholder="Ask about land or the site"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={1000}
              autoComplete="off"
              className="flex-1"
            />
            <Button type="submit" variant="primary" aria-label="Send message" disabled={!text.trim() || sending}>
              <SendIcon size={18} />
            </Button>
          </form>
        </section>
      )}

      <Button
        variant="primary"
        className="chat-fab"
        aria-label={open ? "Close assistant" : "Open assistant"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <CloseIcon size={24} /> : <ChatIcon size={24} />}
      </Button>
    </div>
  );
}
