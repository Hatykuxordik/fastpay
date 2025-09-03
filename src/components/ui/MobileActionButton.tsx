import React from 'react'
import { LucideIcon } from 'lucide-react'

interface MobileActionButtonProps {
  title: string
  description: string
  icon: LucideIcon
  color: string
  onClick: () => void
  disabled?: boolean
}

export const MobileActionButton: React.FC<MobileActionButtonProps> = ({
  title,
  description,
  icon: Icon,
  color,
  onClick,
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full p-6 rounded-2xl text-left transition-all duration-300 transform
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:scale-105 active:scale-95 hover:shadow-xl'
        }
        bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700
        focus:outline-none focus:ring-4 focus:ring-blue-500/20
      `}
    >
      <div className="flex items-start space-x-4">
        <div className={`${color} p-4 rounded-xl shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {description}
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </button>
  )
}

