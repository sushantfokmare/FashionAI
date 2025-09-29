import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import Navbar from "@/components/Navbar";

export default function Contact(){
  return (
    <div className="container py-14 max-w-2xl">
      <h1 className="text-3xl font-bold">Contact</h1>
      <div className="mt-6 grid gap-3">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Your name" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" />
        </div>
        <div>
          <Label htmlFor="msg">Message</Label>
          <Textarea id="msg" rows={4} placeholder="Write your message..." />
        </div>
        <div>
          <Button>Send</Button>
        </div>
      </div>
    </div>
  )
}
