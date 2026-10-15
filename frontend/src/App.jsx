import AppRoutes from "@/routes";
import ApiErrorToast from "@/components/common/ApiErrorToast";

export default function App() {
  return (
    <>
      <AppRoutes />
      <ApiErrorToast />
    </>
  );
}
