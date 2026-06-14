type ErrorContext =
  | "login"
  | "otp"
  | "changePassword"
  | "forgot"
  | "reset"
  | "logout"
  | "network"
  | "generic";

const MESSAGES: Record<ErrorContext, string[]> = {
  login: [
    "Wrong combo. The bouncer isn't letting you in.",
    "Hmm, those creds don't match anything on file.",
    "Even the login form is confused right now. Try again?",
  ],
  otp: [
    "That code didn't work. Maybe try a fresh one?",
    "The OTP checker is being picky today.",
    "Code's off. Give it another go, the universe might cooperate.",
  ],
  changePassword: [
    "That didn't work. Maybe try a different password?",
    "The password vault is being moody.",
    "Server's having second thoughts on that password.",
  ],
  forgot: [
    "Couldn't reach the mailroom. Try again in a sec?",
    "The postman tripped. Try again shortly.",
    "Email elves are on a break.",
  ],
  reset: [
    "That token didn't work. Maybe it expired?",
    "The token bouncer didn't recognize that one.",
    "Hmm, that token's a no-go. Double-check and retry?",
  ],
  logout: [
    "Couldn't log out, but best effort was applied.",
    "Logout is being shy. Refresh the page anyway.",
  ],
  network: [
    "Connection is being shy right now.",
    "Looks like the network is napping.",
    "Something in the pipeline is napping. Try again in a moment.",
  ],
  generic: [
    "Plot twist: that didn't work.",
    "The code is being cheeky. Try again?",
    "The hamsters are catching their breath.",
  ],
};

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) return true;
  const raw = err instanceof Error ? err.message : String(err ?? "");
  return /failed to fetch|networkerror|load failed|network request failed/i.test(raw);
}

export function friendlyError(err: unknown, context: ErrorContext = "generic"): string {
  if (isNetworkError(err)) {
    return pick(MESSAGES.network);
  }
  return pick(MESSAGES[context] ?? MESSAGES.generic);
}
