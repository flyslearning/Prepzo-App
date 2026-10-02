export type NovaMessage = {
  role: "user" | "assistant";
  content: string;
};

const NOVA_URL = process.env.EXPO_PUBLIC_NOVA_API_URL?.trim();

export const novaConfigured = Boolean(NOVA_URL);

export async function askNova(
  messages: NovaMessage[],
  signal?: AbortSignal
): Promise<string> {
  if (!NOVA_URL) {
    throw new Error(
      "Nova chat is not connected yet. You can still use the study shortcuts."
    );
  }

  const response = await fetch(NOVA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",

      // Add your app's existing authenticated session header here
      // if your backend requires it.
    },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok) {
    throw new Error("Nova could not respond. Please try again.");
  }

  const data: unknown = await response.json();

  if (
    !data ||
    typeof data !== "object" ||
    !("reply" in data) ||
    typeof data.reply !== "string" ||
    !data.reply.trim()
  ) {
    throw new Error("Nova returned an empty response. Please try again.");
  }

  return data.reply.trim();
}