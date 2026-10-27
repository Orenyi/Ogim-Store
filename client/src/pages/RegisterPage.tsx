import AuthLayout from "../components/auth/AuthLayout";
import RegisterForm from "../components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout
      eyebrow="+ Join Ogim Store"
      heading="Create your account"
      description="Shop genuine new, UK-used and refurbished phones at the best prices. Create an account to get exclusive deals, track your orders and more."
      showBenefits
    >
      <RegisterForm />
    </AuthLayout>
  );
}
