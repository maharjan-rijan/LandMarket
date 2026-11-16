// Password helpers for the strength meter and the "confirm password" check.

const COMMON = ["password", "password1", "12345678", "123456789", "1234567890", "qwertyuiop", "11111111", "iloveyou", "admin123", "landmarket"];

export const STRENGTH = { 0: "", 1: "Weak", 2: "Medium", 3: "Strong" };

// level 0 = nothing typed, 1 = weak, 2 = medium, 3 = strong
export function getStrength(pw = "") {
  if (!pw) return { level: 0, label: "", tips: [] };

  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  const common = COMMON.includes(pw.toLowerCase());
  const repeated = new Set(pw).size <= 2; // "aaaaaaaa", "abababab"

  const tips = [];
  if (common) tips.push("avoid common passwords");
  if (repeated) tips.push("avoid repeating the same characters");
  if (pw.length < 8) tips.push("use at least 8 characters");
  else if (pw.length < 10) tips.push("make it 10 characters or longer");
  if (classes < 3) tips.push("mix upper and lower case letters, numbers and symbols");

  let level = 2;
  if (pw.length < 8 || classes < 2 || common || repeated) level = 1;
  else if (pw.length >= 10 && classes >= 3) level = 3;

  return { level, label: STRENGTH[level], tips: level === 3 ? [] : tips };
}

// Compares the confirmation with the password while the person types.
//   empty     nothing typed yet
//   typing    every character so far is right, but it is shorter than the password
//   mismatch  a character is wrong; `index` is its 1-based position
//   match     identical
export function compareConfirmation(password, confirm) {
  if (!confirm) return { status: "empty" };
  if (confirm === password) return { status: "match" };

  let i = 0;
  while (i < confirm.length && i < password.length && confirm[i] === password[i]) i += 1;

  if (i === confirm.length) return { status: "typing", matched: i, total: password.length };
  return { status: "mismatch", index: i + 1, extra: i >= password.length };
}
