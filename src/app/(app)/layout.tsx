import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#0D0D1A] text-[#F0EBE0]">
      <header className="border-b border-white/[0.08]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link href="/dashboard" className="font-serif text-lg font-semibold">
            ✦ Style AI
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-[#A098B0] hover:text-[#F0EBE0]">
              Nuevo análisis
            </Link>
            <Link href="/historial" className="text-[#A098B0] hover:text-[#F0EBE0]">
              Historial
            </Link>
            <Link href="/progreso" className="text-[#A098B0] hover:text-[#F0EBE0]">
              Mi Progreso
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-white/[0.08] bg-white/[0.06] px-4 py-1.5 text-[#F0EBE0]"
              >
                Salir
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
