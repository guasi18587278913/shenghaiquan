import { CommunitySwitcher } from '@/components/community-switcher'
import { Navbar } from '@/components/navbar'

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {/* 修改后的导航栏，包含社区切换器 */}
      <Navbar>
        <CommunitySwitcher />
      </Navbar>
      {children}
    </div>
  )
}