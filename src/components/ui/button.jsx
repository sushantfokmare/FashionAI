import React from 'react'
import clsx from 'clsx'

export function Button({ children, className='', variant='primary', size='md', ...props }){
  const base = 'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none'
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-600',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-800',
  }
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg',
    icon: 'h-10 w-10 p-0'
  }
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}
