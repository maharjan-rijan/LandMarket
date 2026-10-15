import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import useForm from "@/hooks/useForm";
import api from "@/lib/api";
import { ROLE_LABELS, ROLE_TONES } from "@/lib/roles";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/common/PageHeader";

// Shared by every role: name, phone and password.
export default function Account() {
  const { user, updateUser } = useAuth();
  const [saved, setSaved] = useState("");

  const profile = useForm({ name: user.name || "", phone: user.phone || "" });
  const password = useForm({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const saveProfile = profile.handleSubmit(async (v) => {
    setSaved("");
    const { data } = await api.put("/account/profile", v);
    updateUser(data);
    setSaved("profile");
  });

  const savePassword = password.handleSubmit(async (v) => {
    setSaved("");
    await api.put("/account/password", v);
    ["current_password", "password", "password_confirmation"].forEach((k) =>
      password.setValue(k, ""),
    );
    setSaved("password");
  });

  const general = (f) =>
    f.errors.message && !Object.keys(f.errors.fields).length
      ? f.errors.message
      : "";

  return (
    <>
      <PageHeader
        title="My account"
        text="Update how buyers, sellers and LandMarket reach you."
      />

      <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
        <form
          onSubmit={saveProfile}
          className="sheet sheet-pad flex flex-col gap-4"
          noValidate
        >
          <div className="flex items-center justify-between gap-3">
            <h2 style={{ fontSize: "1.2rem" }}>Profile</h2>
            <Badge tone={ROLE_TONES[user.role] ?? "gray"}>
              {ROLE_LABELS[user.role] ?? user.role}
            </Badge>
          </div>

          <Alert type="success">
            {saved === "profile" ? "Profile saved." : ""}
          </Alert>
          <Alert>{general(profile)}</Alert>

          <Input
            label="Full name"
            name="name"
            autoComplete="name"
            value={profile.values.name}
            onChange={profile.handleChange}
            error={profile.errors.fields.name}
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={profile.values.phone}
            onChange={profile.handleChange}
            error={profile.errors.fields.phone}
            hint="Sellers and buyers use this to call you."
          />
          <Input
            label="Email"
            name="email"
            value={user.email || ""}
            disabled
            readOnly
            hint="You log in with this address. It cannot be changed here."
          />

          <div>
            <Button type="submit" loading={profile.submitting}>
              Save profile
            </Button>
          </div>
        </form>

        <form
          onSubmit={savePassword}
          className="sheet sheet-pad flex flex-col gap-4"
          noValidate
        >
          <h2 style={{ fontSize: "1.2rem" }}>Password</h2>

          <Alert type="success">
            {saved === "password" ? "Password updated." : ""}
          </Alert>
          <Alert>{general(password)}</Alert>

          <Input
            label="Current password"
            name="current_password"
            type="password"
            autoComplete="current-password"
            value={password.values.current_password}
            onChange={password.handleChange}
            error={password.errors.fields.current_password}
          />
          <Input
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password.values.password}
            onChange={password.handleChange}
            error={password.errors.fields.password}
            hint="At least 8 characters."
          />
          <Input
            label="Confirm new password"
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            value={password.values.password_confirmation}
            onChange={password.handleChange}
            error={password.errors.fields.password_confirmation}
          />

          <div>
            <Button type="submit" loading={password.submitting}>
              Update password
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
