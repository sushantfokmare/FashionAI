import React from 'react'
import clsx from 'clsx'

export function Card({ className='', children }){
  return <div className={clsx('rounded-2xl border border-gray-200 bg-white shadow-sm', className)}>{children}</div>
}
export function CardHeader({ className='', children }){
  return <div className={clsx('px-6 pt-6', className)}>{children}</div>
}
export function CardTitle({ className='', children }){
  return <h3 className={clsx('text-xl font-semibold tracking-tight', className)}>{children}</h3>
}
export function CardContent({ className='', children }){
  return <div className={clsx('px-6 pb-6', className)}>{children}</div>
}
