interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

export default function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div className="rounded-2xl p-5 border"
      style={{
        background: accent ? "var(--brand-green)" : "var(--surface)",
        borderColor: accent ? "transparent" : "var(--bg-dark)",
      }}>
      <div className="text-[10px] uppercase tracking-[2px] font-semibold mb-2"
        style={{ color: accent ? "var(--brand-gold)" : "var(--text-sec)" }}>
        {label}
      </div>
      <div className="text-3xl font-bold"
        style={{ color: accent ? "white" : "var(--primary)" }}>
        {value}
      </div>
      {sub && (
        <div className="text-xs mt-1"
          style={{ color: accent ? "#a8c5b0" : "var(--text-sec)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}
