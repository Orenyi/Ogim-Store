import { useState } from "react";
import { apiRequest, ApiError } from "../lib/api";
import { useToast } from "../components/ui/ToastProvider";

export default function ApiTest() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function testConnection() {
    setLoading(true);

    try {
      const result = await apiRequest<unknown>("/health");

      console.log("Health endpoint response:", result);
      toast.success("Connected to the Ogim Store API.");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-container py-8">
      <h2 className="text-xl font-bold">API connection test</h2>

      <button
        type="button"
        onClick={testConnection}
        disabled={loading}
        className="mt-4 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2.5 font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Testing..." : "Test API connection"}
      </button>
    </section>
  );
}
