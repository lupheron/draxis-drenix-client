import RequireAuth from "@/components/Auth/RequireAuth";
import AppShellDefault from "@/components/Layout/AppShellDefault";

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAuth>
      <AppShellDefault>{children}</AppShellDefault>
    </RequireAuth>
  );
}
