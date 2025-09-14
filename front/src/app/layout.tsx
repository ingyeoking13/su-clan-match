import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { MobileHeader } from '@/components/MobileHeader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'S.U Clan Dashboard',
  description: '게임 클랜 관리 대시보드',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-100 max-w-full overflow-x-hidden">
          {/* 데스크톱 사이드바 */}
          <div className="hidden lg:flex">
            <Sidebar />
          </div>
          
          {/* 모바일 헤더 + 메인 컨텐츠 */}
          <div className="flex-1 flex flex-col">
            {/* 모바일 헤더 */}
            <div className="lg:hidden">
              <MobileHeader />
            </div>
            
            {/* 메인 컨텐츠 */}
            <main className="flex-1 overflow-y-auto">
              <div className="p-3 sm:p-4 lg:p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}