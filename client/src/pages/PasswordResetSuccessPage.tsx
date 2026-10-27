import AuthLayout from "../components/auth/AuthLayout";
import PasswordResetSuccess from "../components/auth/PasswordResetSuccess";

export default function PasswordResetSuccessPage() {
  return (
    <AuthLayout
      eyebrow="Account security"
      heading="Back to shopping"
      description="Your Ogim Store account experience, designed to help you shop with confidence."
      showBenefits={false}
    >
      <PasswordResetSuccess />
    </AuthLayout>
  );
}
