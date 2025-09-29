import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { User } from '@/entities/User'
import { createPageUrl } from '@/utils'
import { Button } from '@/components/ui/button'
import { SheetController } from '@/components/ui/sheet'
import { Menu, Sparkles, Home as HomeIcon, Box, User as UserIcon, Contact } from 'lucide-react'

const navItems = [
  { name: 'Home', href: createPageUrl('Home') },
  { name: 'Generator', href: createPageUrl('Generator') },
  { name: 'About', href: createPageUrl('About') },
  { name: 'Contact', href: createPageUrl('Contact') },
]

export default function Layout({ children }){
  const [user, setUser] = useState(null)
  const location = useLocation()

  useEffect(()=>{
    (async ()=>{
      try { setUser(await User.me()) } catch { setUser(null) }
    })()
  }, [location.pathname])

  const handleLogout = async () => {
    await User.logout()
    setUser(null)
    window.location.href = createPageUrl('Home')
  }

  const NavLink = ({ href, children, className='' }) => (
    <Link to={href} className={`font-medium transition-colors hover:text-indigo-600 ${location.pathname===href?'text-indigo-600':'text-gray-600'} ${className}`}>
      {children}
    </Link>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur">
        <div className="container flex h-16 items-center">
          <Link to="/" className="mr-6 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            <span className="font-bold text-lg">FashionAI</span>
          </Link>

          <nav className="hidden md:flex flex-1 items-center gap-6 text-sm">
            {navItems.map(item => <NavLink key={item.name} href={item.href}>{item.name}</NavLink>)}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <NavLink href={createPageUrl('Dashboard')}>Dashboard</NavLink>
                <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <Button size="sm" onClick={()=>User.login()}>Login</Button>
            )}
          </div>

          {/* mobile */}
          <div className="flex flex-1 items-center justify-end md:hidden">
            <SheetController
              trigger={<Button variant="ghost" size="icon"><Menu className="h-5 w-5" /><span className="sr-only">Toggle Menu</span></Button>}
              side="right"
            >
              <nav className="grid gap-4 text-lg font-medium mt-2">
                {navItems.map(item => (
                  <Link key={item.name} to={item.href} className="px-2.5 text-gray-600 hover:text-gray-900">{item.name}</Link>
                ))}
                <div className="border-t pt-4 mt-2">
                  {user ? (
                    <>
                      <Link to={createPageUrl('Dashboard')} className="block px-2.5 text-gray-600 hover:text-gray-900">Dashboard</Link>
                      <button onClick={handleLogout} className="mt-3 block w-full text-left px-2.5 text-gray-600 hover:text-gray-900">Logout</button>
                    </>
                  ) : (
                    <button onClick={()=>User.login()} className="block w-full text-left px-2.5 text-gray-600 hover:text-gray-900">Login</button>
                  )}
                </div>
              </nav>
            </SheetController>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-white">
        <div className="container py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} FashionAI. All rights reserved.</p>
          <div className="flex gap-4">
            <NavLink href="#" className="text-sm">Privacy Policy</NavLink>
            <NavLink href="#" className="text-sm">Terms of Service</NavLink>
          </div>
        </div>
      </footer>
    </div>
  )
}
