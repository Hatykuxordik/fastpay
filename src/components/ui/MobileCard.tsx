import React from 'react'
import { LucideIcon } from 'lucide-react'

interface MobileCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  gradient?: boolean
  onClick?: () => void
  className?: string
}

export const MobileCard: React.FC<MobileCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  gradient = false,
  onClick,
  className = ''
}) => {
  const baseClasses = `
    relative overflow-hidden rounded-2xl p-6 transition-all duration-300 transform
    ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
    ${gradient 
      ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white shadow-xl' 
      : 'bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700'
    }
    ${className}
  `

  const changeColorClasses = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className={baseClasses} onClick={onClick}>
      {/* Background decoration */}
      {gradient && (
        <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
          <div className="absolute inset-0 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
        </div>
      )}
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${
            gradient 
              ? 'bg-white/20 backdrop-blur-sm' 
              : 'bg-blue-50 dark:bg-blue-900/20'
          }`}>
            <Icon className={`h-6 w-6 ${
              gradient 
                ? 'text-white' 
                : 'text-blue-600 dark:text-blue-400'
            }`} />
          </div>
          
          {change && (
            <div className={`text-sm font-medium ${
              gradient ? 'text-white/80' : changeColorClasses[changeType]
            }`}>
              {change}
            </div>
          )}
        </div>
        
        <div>
          <p className={`text-sm font-medium mb-2 ${
            gradient 
              ? 'text-white/80' 
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${
            gradient 
              ? 'text-white' 
              : 'text-gray-900 dark:text-white'
          }`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

