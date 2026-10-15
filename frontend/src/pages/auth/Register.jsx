import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import useForm from "@/hooks/useForm";
import { dashboardPath, ROLES } from "@/lib/roles";
import { PATHS } from "@/routes/paths";
import AuthCard from "@/components/auth/AuthCard";
import RoleSelector from "@/components/auth/RoleSelector";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const { values, errors, submitting, handleChange, setValue, handleSubmit } =
    useForm({
      name: "",
      email: "",
      phone: "",
      role: ROLES.BUYER,
      store_name: "",
      password: "",
      password_confirmation: "", // must be named exactly this for Laravel's "confirmed" rule
    });

  const onSubmit = handleSubmit(async (data) => {
    const payload = { ...data };
    if (payload.role !== ROLES.SELLER) delete payload.store_name;
    const user = await register(payload);
    navigate(dashboardPath(user.role), { replace: true });
  });

  return (
    <AuthCard
      title="Create your account"
      subtitle="Choose how you want to use LandMarket."
      footer={
        <>
          Already have an account?{" "}
          <Link to={PATHS.login} className="link">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Alert>
          {errors.message && !Object.keys(errors.fields).length
            ? errors.message
            : ""}
        </Alert>

        <RoleSelector
          value={values.role}
          onChange={(v) => setValue("role", v)}
          error={errors.fields.role}
        />

        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={handleChange}
          error={errors.fields.name}
        />

        {values.role === ROLES.SELLER && (
          <Input
            label="Business or agency name (optional)"
            name="store_name"
            value={values.store_name}
            onChange={handleChange}
            error={errors.fields.store_name}
            hint="Shown on your public store page. Leave blank to use your name."
          />
        )}

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          error={errors.fields.email}
        />
        <Input
          label="Phone (optional)"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={handleChange}
          error={errors.fields.phone}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={handleChange}
          error={errors.fields.password}
        />
        <Input
          label="Confirm password"
          name="password_confirmation"
          type="password"
          autoComplete="new-password"
          value={values.password_confirmation}
          onChange={handleChange}
          error={errors.fields.password_confirmation}
        />

        <Button type="submit" loading={submitting} className="btn-block">
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
