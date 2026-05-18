import { BottomNav } from '@/components/ui/BottomNav'

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <main className="flex-1 overflow-hidden">{children}</main>
      <BottomNav />
    </div>
  )
}
