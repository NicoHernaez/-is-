"use client";

import TabBar from "@/components/ui/TabBar";
import PhoneEntry from "@/components/ui/PhoneEntry";
import OnboardingFlow from "@/components/ui/OnboardingFlow";
import { UserProvider, useUser } from "@/lib/user-context";

function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, phone, reloadProfile } = useUser();

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

  // Con teléfono pero sin usuario en DB → onboarding in-app
  if (!user) {
    return <OnboardingFlow phone={phone} onComplete={reloadProfile} />;
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
