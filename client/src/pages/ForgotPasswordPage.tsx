import AuthLayout from "../components/auth/AuthLayout";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      eyebrow="Get back"
      heading="Get back to shopping"
      description="Reset your password to access your account and continue shopping genuine phones at the best prices."
      showBenefits={false}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
