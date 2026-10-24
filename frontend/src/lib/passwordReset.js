import api from "@/lib/api";

// Step 1. Emails a one-time code to the address. The API answers the same way whether or not
// the address has an account, so this never reveals who is registered.
export const requestResetCode = (email) => api.post("/auth/forgot-password", { email });

// Step 2. Checks the code. Resolves with a one-time token that unlocks step 3.
export const verifyResetCode = async ({ email, code }) => {
  const { data } = await api.post("/auth/verify-reset-code", { email, code });
  return data.token;
};

// Step 3. Sets the new password. payload: { email, token, password, password_confirmation }
export const resetPassword = (payload) => api.post("/auth/reset-password", payload);
