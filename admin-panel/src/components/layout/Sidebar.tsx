"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/promos", label: "Promos", icon: "🏷️" },
  { href: "/banks", label: "Bancos", icon: "🏦" },
  { href: "/cities", label: "Ciudades", icon: "📍" },
  { href: "/club", label: "Club Amigas", icon: "💚" },
  { href: "/users", label: "Usuarias", icon: "👥" },
  { href: "/scraping", label: "Scraping", icon: "🤖" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 flex flex-col border-r border-[var(--bg-dark)]"
      style={{ background: "var(--brand-green)" }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="text-2xl tracking-widest text-white" style={{ fontFamily: "Georgia, serif" }}>
          <span style={{ color: "var(--brand-gold)" }}>-</span>es
          <span style={{ color: "var(--brand-gold)" }}>+</span>
        </div>
        <div className="text-[10px] uppercase tracking-[3px] mt-1" style={{ color: "#a8c5b0" }}>
          Admin Panel
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-all ${
                active
                  ? "bg-white/15 text-white font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/10 text-[10px] text-white/30">
        General Pico, LP
      </div>
    </aside>
  );
}
