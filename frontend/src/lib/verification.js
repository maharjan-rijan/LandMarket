import api from "@/lib/api";

export const OTP_LENGTH = 6;
export const RESEND_SECONDS = 60;

// Laravel sends a timestamp once the address is confirmed, null before that.
export const isEmailVerified = (user) => Boolean(user?.email_verified_at);
export const isPhoneVerified = (user) => Boolean(user?.phone_verified_at);

// "anil@landmarket.test" -> "a***@landmarket.test"
export const maskEmail = (email = "") => {
  const [name, domain] = email.split("@");
  return domain ? `${name[0]}***@${domain}` : email;
};

// Emails a fresh one-time code to the logged-in user.
export const sendEmailOtp = () => api.post("/account/email/send-otp");

// Checks the code the user typed. Resolves when the email is verified.
<<<<<<< HEAD
export const verifyEmailOtp = (code) => api.post("/account/email/verify", { code });
=======
export const verifyEmailOtp = (code) =>
  api.post("/account/email/verify", { code });
>>>>>>> 28b5ddfd326781e19d70ed92f750195485336fce
