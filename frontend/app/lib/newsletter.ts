const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const ADMIN = process.env.NEXT_PUBLIC_ADMIN_ROUTE || "configure-deafult-here";

export type UnsubscribeResult = { status: "success" | "error" | "info"; message: string };

export async function unsubscribe(email: string): Promise<UnsubscribeResult> {
  const res = await fetch(`${API}${ADMIN}/api/community/newsletter/unsubscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = (await res.json().catch(() => ({ error: "Request failed" }))) as {
    error?: string;
    message?: string;
  };
  if (!res.ok) {
    if (res.status === 404) {
      return { status: "error", message: "That email is not on the subscription list." };
    }
    if (res.status === 429) {
      return { status: "error", message: "Too many attempts. Try again in a few minutes." };
    }
    return { status: "error", message: data.error || "Could not unsubscribe right now." };
  }
  return { status: "success", message: data.message || "Unsubscribed successfully." };
}
