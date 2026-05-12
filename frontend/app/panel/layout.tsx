import { RequireAuth } from "@/components/auth/require-auth"

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RequireAuth>{children}</RequireAuth>
}
