export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(47,22%,96%)] bg-gradient-to-br from-[hsl(47,22%,96%)] via-[hsl(40,20%,98%)] to-[hsl(28,25%,92%)]">
      {children}
    </div>
  );
}
