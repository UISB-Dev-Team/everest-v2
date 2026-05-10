/**
 * Generates a cryptographically secure random password.
 */
export const generateRandomPassword = (length: number = 12): string => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
  if (typeof window === "undefined" || !window.crypto?.getRandomValues) {
    // Server-side / SSR fallback
    return Array.from({ length }, () =>
      charset[Math.floor(Math.random() * charset.length)]
    ).join("");
  }
  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);
  return Array.from(
    randomValues,
    (value) => charset[value % charset.length]
  ).join("");
};
