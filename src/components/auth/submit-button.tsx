"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#E2C47A] px-6 py-3 text-sm font-semibold text-[#0D0D1A] shadow-[0_4px_20px_rgba(201,168,76,0.28)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Cargando..." : children}
    </button>
  );
}
