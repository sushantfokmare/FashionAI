import React from 'react'
import clsx from 'clsx'

export function Input({ className='', ...props }){
  return (
    <input
      className={clsx('w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500', className)}
      {...props}
    />
  )
}
