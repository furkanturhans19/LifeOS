import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Life',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-4 safe-top safe-bottom">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 50% at 50% -10%, hsl(var(--primary) / 0.14), transparent 60%), radial-gradient(ellipse 40% 30% at 90% 80%, hsl(148 22% 52% / 0.08), transparent 50%)',
        }}
      />
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
