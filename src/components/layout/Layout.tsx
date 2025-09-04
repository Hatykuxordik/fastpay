'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileBottomNav } from './MobileBottomNav'

interface LayoutProps {
  children: React.ReactNode
  user?: any
}

export const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Check if we're on a page that should show mobile bottom nav
  const showMobileBottomNav = ['/dashboard', '/transactions', '/analytics', '/settings'].includes(pathname);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header 
        user={user}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <main className={`flex-1 ${showMobileBottomNav ? 'pb-20 md:pb-0' : ''}`}>
        {children}
      </main>
      
      {showMobileBottomNav && <MobileBottomNav />}
      
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  )
}

