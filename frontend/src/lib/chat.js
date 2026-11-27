import api from "@/lib/api";

// Sends the conversation so far; the last item must be the person's message.
// Returns { reply, lands }.
export async function askAssistant(messages) {
  const { data } = await api.post("/chat", {
    messages: messages.map(({ role, content }) => ({ role, content })),
  });
  return data;
}
