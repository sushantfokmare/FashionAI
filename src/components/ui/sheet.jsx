import React, { useState } from 'react'

export function Sheet({ children }){
  return children
}

export function SheetTrigger({ asChild=false, children, onClick }){
  const child = React.Children.only(children)
  return React.cloneElement(child, { onClick })
}

export function SheetContent({ side='right', children, open, onOpenChange }){
  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-black/30 ${open ? 'opacity-100' : 'opacity-0'} transition-opacity`} onClick={()=>onOpenChange(false)}></div>
      <div className={`absolute top-0 ${side==='right'?'right-0':'left-0'} h-full w-80 bg-white shadow-xl transition-transform ${open ? 'translate-x-0' : side==='right' ? 'translate-x-full' : '-translate-x-full'}`}>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// Small helper wrapper to manage open state in layout
export function SheetController({ trigger, children, side='right' }){
  const [open, setOpen] = useState(false)
  return (
    <>
      <SheetTrigger onClick={()=>setOpen(true)} asChild>{trigger}</SheetTrigger>
      <SheetContent side={side} open={open} onOpenChange={setOpen}>
        {children}
      </SheetContent>
    </>
  )
}
