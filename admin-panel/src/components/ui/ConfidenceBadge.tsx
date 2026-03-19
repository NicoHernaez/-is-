const CONF = {
  confirmed:   { bg: "rgba(22,163,74,0.08)",  color: "#16A34A", label: "Confirmado" },
  probable:    { bg: "rgba(217,119,6,0.08)",   color: "#D97706", label: "Probable" },
  community:   { bg: "rgba(37,99,235,0.08)",   color: "#2563EB", label: "Comunidad" },
  unconfirmed: { bg: "rgba(156,163,175,0.08)", color: "#9CA3AF", label: "Sin confirmar" },
} as const;

type Status = keyof typeof CONF;

export default function ConfidenceBadge({ status }: { status: Status }) {
  const cfg = CONF[status] || CONF.unconfirmed;
  return (
    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}
