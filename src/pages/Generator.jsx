import React, { useState } from 'react'
import { InvokeLLM, UploadFile } from '@/integrations/Core'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react'

export default function Generator(){
  const [prompt, setPrompt] = useState('')
  const [fit, setFit] = useState('casual')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const onUpload = async (e) => {
    const file = e.target.files?.[0]
    if(!file) return
    const { url } = await UploadFile(file)
    setImage(url)
  }

  const onGenerate = async () => {
    if(!prompt && !image) return
    setLoading(true)
    const res = await InvokeLLM(`${prompt} | style:${fit}`)
    setResult(res.text)
    setLoading(false)
  }

  return (
    <div className="container py-10 grid md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="desc">Describe your style</Label>
              <Textarea id="desc" rows={4} placeholder="e.g., streetwear with monochrome palette and oversized jacket" value={prompt} onChange={e=>setPrompt(e.target.value)} />
            </div>

            <div>
              <Label>Choose fit</Label>
              <RadioGroup value={fit} onValueChange={setFit}>
                <RadioGroupItem value="casual" label="Casual" />
                <RadioGroupItem value="formal" label="Formal" />
                <RadioGroupItem value="streetwear" label="Streetwear" />
              </RadioGroup>
            </div>

            <div>
              <Label>Upload inspiration image (optional)</Label>
              <label className="mt-1 flex items-center gap-3 rounded-xl border border-dashed px-4 py-6 cursor-pointer hover:bg-gray-50">
                <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                <ImageIcon className="h-5 w-5" />
                <span className="text-sm text-gray-600">Click to upload</span>
              </label>
              {image && <img src={image} alt="preview" className="mt-3 rounded-xl border max-h-56 object-cover" />}
            </div>

            <div>
              <Button onClick={onGenerate} disabled={loading} className="w-full">
                {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Generating...</span> : 'Generate Outfit Ideas'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">AI Result</h3>
          {result ? (
            <p className="text-gray-700 whitespace-pre-wrap">{result}</p>
          ) : (
            <p className="text-gray-500">Your generated outfit ideas will appear here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
