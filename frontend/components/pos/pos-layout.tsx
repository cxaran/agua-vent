import { Sidebar } from "@/components/pos/sidebar"
import { Header } from "@/components/pos/header"
import { SubscriptionBanner } from "@/components/pos/subscription-banner"

export default function POSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <SubscriptionBanner />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
