import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import useForm from "@/hooks/useForm";
import { dashboardPath } from "@/lib/roles";
import { PATHS } from "@/routes/paths";
import AuthCard from "@/components/auth/AuthCard";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { values, errors, submitting, handleChange, handleSubmit } = useForm({
    email: "",
    password: "",
  });

  const onSubmit = handleSubmit(async (data) => {
    const user = await login(data);
    // Go back to the page they came from (for example a land they tried to save)
    const from = location.state?.from?.pathname;
    navigate(from && from !== PATHS.login ? from : dashboardPath(user.role), {
      replace: true,
    });
  });

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Login to manage your lands and inquiries."
      footer={
        <>
          New to LandMarket?{" "}
          <Link to={PATHS.register} className="link">
            Create an account
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
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
          error={errors.fields.password}
        />
        <Button type="submit" loading={submitting} className="btn-block">
          Login
        </Button>
      </form>
    </AuthCard>
  );
}
