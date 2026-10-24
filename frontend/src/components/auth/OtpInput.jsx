import { OTP_LENGTH } from "@/lib/verification";
import Input from "@/components/ui/Input";

// The box where people type the emailed code: digits only, wide letter spacing.
// onChange receives the cleaned string, not the event.
export default function OtpInput({ value, onChange, name = "code", label = "Verification code", ...props }) {
  return (
    <Input
      name={name}
      label={label}
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={OTP_LENGTH}
      placeholder={"0".repeat(OTP_LENGTH)}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      style={{ letterSpacing: "0.4em", fontSize: "1.25rem", textAlign: "center" }}
      {...props}
    />
  );
}
