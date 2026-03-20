import TabBar from "@/components/ui/TabBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh pb-[80px]">
      {children}
      <TabBar />
    </div>
  );
}
