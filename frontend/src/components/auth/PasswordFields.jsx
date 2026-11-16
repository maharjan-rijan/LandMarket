import { compareConfirmation } from "@/lib/password";
import Input from "@/components/ui/Input";
import PasswordStrength from "@/components/ui/PasswordStrength";

// Password and confirmation as one unit:
//  - the password field shows a Weak / Medium / Strong meter,
//  - the confirmation warns on the first wrong character and says "match" when they are identical.
// Server errors (errors.password, errors.password_confirmation) still take priority.
export default function PasswordFields({
  values,
  onChange,
  errors = {},
  passwordLabel = "Password",
  confirmLabel = "Confirm password",
  hint = "At least 8 characters.",
}) {
  const check = compareConfirmation(values.password, values.password_confirmation);

  // What to tell the person about the confirmation box
  let feedback = {};
  if (check.status === "match") {
    feedback = { success: "Passwords match." };
  } else if (check.status === "mismatch") {
    feedback = {
      warning: !values.password
        ? "Type the password above first."
        : check.extra
          ? "Passwords do not match: there are extra characters at the end."
          : `Passwords do not match. Check character ${check.index}.`,
    };
  } else if (check.status === "typing") {
    feedback = { hint: `${check.matched} of ${check.total} characters match so far.` };
  }

  return (
    <>
      <div>
        <Input
          label={passwordLabel}
          name="password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={onChange}
          error={errors.password}
          hint={hint}
        />
        <PasswordStrength password={values.password} />
      </div>

      <Input
        label={confirmLabel}
        name="password_confirmation"
        type="password"
        autoComplete="new-password"
        value={values.password_confirmation}
        onChange={onChange}
        error={errors.password_confirmation}
        {...feedback}
      />
    </>
  );
}
