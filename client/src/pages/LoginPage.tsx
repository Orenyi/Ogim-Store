import AuthLayout from "../components/auth/AuthLayout";
import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Welcome back"
      heading="Sign in to Ogim Store"
      description="Continue shopping genuine new, UK-used and refurbished phones at the best prices."
      showBenefits
    >
      <LoginForm />
    </AuthLayout>
  );
}
