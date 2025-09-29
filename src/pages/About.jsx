import React from 'react'
import Navbar from "@/components/Navbar";

export default function About(){
  return (
    <div className="container py-14 max-w-3xl">
      <h1 className="text-3xl font-bold">About</h1>
      <p className="mt-3 text-gray-600">
        FashionAI helps you discover new outfits using simple prompts or images. Built with React, Vite and TailwindCSS.
      </p>
    </div>
  )
}
