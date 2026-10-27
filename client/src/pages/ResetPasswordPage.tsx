import AuthLayout from "../components/auth/AuthLayout";
import ResetPasswordForm from "../components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      eyebrow="Secure your account"
      heading="Get back to shopping"
      description="Choose a strong new password to help keep your Ogim Store account secure."
      showBenefits={false}
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
