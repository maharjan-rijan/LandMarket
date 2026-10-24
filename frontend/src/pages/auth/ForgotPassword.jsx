import { useState } from "react";
import { Link } from "react-router-dom";

import useForm from "@/hooks/useForm";
import { requestResetCode, resetPassword } from "@/lib/passwordReset";
import { PATHS } from "@/routes/paths";
import AuthCard from "@/components/auth/AuthCard";
import ResetCodeDialog from "@/components/auth/ResetCodeDialog";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// 1. email       ask for the email
// 2. code        same page, the code popup is open on top of the email form
// 3. reset       popup accepted the code: choose the new password
// 4. done        password changed
const COPY = {
  email: {
    title: "Forgot your password?",
    subtitle: "Enter your email and we will send you a code to reset it.",
  },
  reset: {
    title: "Choose a new password",
    subtitle: "Your code was accepted. Pick a new password for your account.",
  },
  done: {
    title: "Password changed",
    subtitle: "You can login with your new password now.",
  },
};

export default function ForgotPassword() {
  const [step, setStep] = useState("email"); // email | code | reset | done
  const [token, setToken] = useState(""); // one-time token the API gave after a valid code

  const { values, errors, submitting, handleChange, handleSubmit } = useForm({
    email: "",
    password: "",
    password_confirmation: "",
  });

  const sendCode = handleSubmit(async ({ email }) => {
    await requestResetCode(email);
    setStep("code");
  });

  const reset = handleSubmit(async ({ email, password, password_confirmation }) => {
    await resetPassword({ email, token, password, password_confirmation });
    setStep("done");
  });

  // A closing popup reports back late (native <dialog> "close" event). Only go back to the
  // email form if the popup is still the current step, not after it moved on to "reset".
  const closeCode = () => setStep((s) => (s === "code" ? "email" : s));

  const onVerified = (t) => {
    setToken(t);
    setStep("reset");
  };

  const general =
    (errors.fields.token || errors.message) && !errors.fields.password && !errors.fields.email
      ? errors.fields.token || errors.message
      : "";

  const view = step === "code" ? "email" : step; // the popup sits on top of the email form

  return (
    <AuthCard
      title={COPY[view].title}
      subtitle={COPY[view].subtitle}
      footer={
        <Link to={PATHS.login} className="link">
          Back to login
        </Link>
      }
    >
      {view === "email" && (
        <form onSubmit={sendCode} className="flex flex-col gap-4" noValidate>
          <Alert>{general}</Alert>
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            error={errors.fields.email}
          />
          <Button type="submit" loading={submitting} className="btn-block">
            Send code
          </Button>
        </form>
      )}

      {view === "reset" && (
        <form onSubmit={reset} className="flex flex-col gap-4" noValidate>
          <Alert type="success">Code verified for {values.email}.</Alert>
          <Alert>{general}</Alert>
          <Input
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange}
            error={errors.fields.password}
            hint="At least 8 characters."
          />
          <Input
            label="Confirm new password"
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            value={values.password_confirmation}
            onChange={handleChange}
            error={errors.fields.password_confirmation}
          />
          <Button type="submit" loading={submitting} className="btn-block">
            Reset password
          </Button>
          {errors.fields.token && (
            <Button variant="ghost" size="sm" onClick={() => setStep("email")}>
              Start again
            </Button>
          )}
        </form>
      )}

      {view === "done" && (
        <div className="flex flex-col gap-4">
          <Alert type="success">Your password was changed. Other devices are logged out.</Alert>
          <Button to={PATHS.login} className="btn-block">
            Go to login
          </Button>
        </div>
      )}

      <ResetCodeDialog
        open={step === "code"}
        email={values.email}
        onClose={closeCode}
        onVerified={onVerified}
      />
    </AuthCard>
  );
}
