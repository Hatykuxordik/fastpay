import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  ArrowLeftRight, 
  BarChart3, 
  Settings,
  CreditCard
} from 'lucide-react'

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/dashboard',
      icon: Home,
      label: 'Home',
      active: pathname === '/dashboard'
    },
    {
      href: '/transactions',
      icon: ArrowLeftRight,
      label: 'Transactions',
      active: pathname === '/transactions'
    },
    {
      href: '#',
      icon: CreditCard,
      label: 'Pay',
      active: false,
      isAction: true
    },
    {
      href: '/analytics',
      icon: BarChart3,
      label: 'Analytics',
      active: pathname === '/analytics'
    },
    {
      href: '/settings',
      icon: Settings,
      label: 'Settings',
      active: pathname === '/settings'
    }
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
              item.isAction
                ? 'bg-blue-600 text-white shadow-lg transform hover:scale-105'
                : item.active
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <item.icon className={`h-5 w-5 ${item.isAction ? 'mb-0' : 'mb-1'}`} />
            {!item.isAction && (
              <span className="text-xs font-medium">{item.label}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

