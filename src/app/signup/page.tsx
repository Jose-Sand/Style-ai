"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { signUp, type AuthFormState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: AuthFormState = { error: null };

export default function SignupPage() {
  const [state, formAction] = useFormState(signUp, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0D0D1A] px-5 text-[#F0EBE0]">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-block rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#C9A84C]">
            ✦ Style AI
          </div>
          <h1 className="font-serif text-3xl font-semibold">Crea tu cuenta</h1>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#A098B0]">
              Nombre
            </label>
            <input
              type="text"
              name="fullName"
              required
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm outline-none focus:border-[#C9A84C]/50"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#A098B0]">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm outline-none focus:border-[#C9A84C]/50"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#A098B0]">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm outline-none focus:border-[#C9A84C]/50"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          {state.error && (
            <div className="rounded-xl border border-[#C47878]/30 bg-[#C47878]/10 px-4 py-3 text-sm text-[#E0A0A0]">
              ⚠️ {state.error}
            </div>
          )}

          <SubmitButton>Crear cuenta</SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-[#6A6080]">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-[#C9A84C] hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
