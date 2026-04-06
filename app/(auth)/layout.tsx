import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-mesh font-body text-on-background min-h-screen flex items-center justify-center p-6 relative">
      {/* Theme Toggle */}
      <div className="fixed top-8 right-8 z-50">
        <ThemeToggle />
      </div>
      {/* Background Decoration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] aspect-square rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] aspect-square rounded-full bg-gradient-to-tr from-secondary/20 to-transparent blur-[120px]" />
      </div>
      {children}
    </div>
  );
}
