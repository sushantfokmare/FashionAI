import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createPageUrl } from '@/utils'

export default function Home(){
  return (
    <div className="container py-14">
      <div className="mx-auto max-w-3xl text-center">
        <p className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-600 mb-4">
          <span className="inline-block h-2 w-2 rounded-full bg-indigo-500"></span> Fashion AI
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Discover Your Next Style with <span className="text-indigo-600">AI</span>
        </h1>
        <p className="mt-3 text-gray-600">
          Upload an image or describe a style, and let our AI generate unique fashion recommendations tailored just for you.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a href={createPageUrl('Generator')}><Button size="lg">Get Started</Button></a>
          <a href="#how-it-works"><Button variant="outline" size="lg">How It Works</Button></a>
        </div>
      </div>

      <section id="how-it-works" className="mt-16 grid md:grid-cols-3 gap-6">
        {[
          { title: 'Upload or Describe', desc: 'Share an image or describe the vibe.' },
          { title: 'AI Analysis', desc: 'Our smart algorithm analyzes your style.' },
          { title: 'Get Recommendations', desc: 'Receive curated fashion items for you.' },
        ].map((it, i)=>(
          <Card key={i}>
            <CardHeader>
              <CardTitle>{it.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{it.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold">Ready to redefine your style?</h2>
        <p className="text-gray-600 mt-1">Join thousands of users discovering their unique fashion identity.</p>
        <a href={createPageUrl('Generator')}><Button className="mt-4">Try FashionAI Now</Button></a>
      </div>
    </div>
  )
}
