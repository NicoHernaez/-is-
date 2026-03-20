"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", icon: "🏠", label: "Inicio" },
  { href: "/descuentos", icon: "🏷️", label: "Descuentos" },
  { href: "/yapa", icon: "🛍️", label: "Yapa" },
  { href: "/comunidad", icon: "👥", label: "Comunidad" },
  { href: "/perfil", icon: "👤", label: "Perfil" },
];

export default function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-[72px] pb-[env(safe-area-inset-bottom)] border-t"
      style={{ background: "var(--bg)", borderColor: "rgba(74,94,60,0.06)", backdropFilter: "blur(16px)", maxWidth: 430, margin: "0 auto" }}>
      {TABS.map(t => {
        const active = pathname === t.href || (t.href !== "/" && pathname.startsWith(t.href));
        return (
          <Link key={t.href} href={t.href} className="flex flex-col items-center gap-0.5 pt-2" style={{ opacity: active ? 1 : 0.4 }}>
            <span className="text-[22px]">{t.icon}</span>
            <span className="text-[9px] font-semibold" style={{ color: active ? "var(--primary)" : "var(--text-sec)" }}>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
