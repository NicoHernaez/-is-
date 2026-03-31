"use client";

import TabBar from "@/components/ui/TabBar";
import PhoneEntry from "@/components/ui/PhoneEntry";
import { UserProvider, useUser } from "@/lib/user-context";

function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, phone } = useUser();

  // Cargando
  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-center">
          <div className="text-[32px] font-extrabold mb-2" style={{ color: "var(--primary)" }}>-es+</div>
          <div className="text-[12px]" style={{ color: "var(--text-sec)" }}>Cargando...</div>
        </div>
      </div>
    );
  }

  // Sin teléfono → pantalla de entrada
  if (!phone) {
    return <PhoneEntry />;
  }

  // Con teléfono pero sin usuario en DB → pantalla de "te mandamos WA"
  if (!user) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-8" style={{ background: "var(--bg)" }}>
        <div className="text-[48px] font-extrabold mb-4" style={{ color: "var(--primary)" }}>-es+</div>
        <div className="text-[15px] font-semibold mb-2 text-center" style={{ color: "var(--text)" }}>
          Todavía no te registraste
        </div>
        <div className="text-[13px] text-center leading-relaxed mb-6 max-w-[280px]" style={{ color: "var(--text-sec)" }}>
          Mandá <b>Hola</b> al número de -es+ por WhatsApp y Yapa te va a guiar para empezar 🛍️
        </div>
        <a
          href="https://wa.me/5492302649797?text=Hola"
          target="_blank"
          rel="noopener noreferrer"
          className="py-3.5 px-8 rounded-[16px] text-[15px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, #25D366, #128C7E)", boxShadow: "0 4px 16px rgba(37,211,102,0.25)" }}>
          Abrir WhatsApp
        </a>
      </div>
    );
  }

  // Usuario logueado → app normal
  return (
    <div className="min-h-dvh pb-[80px]">
      {children}
      <TabBar />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <AppShell>{children}</AppShell>
    </UserProvider>
  );
}
