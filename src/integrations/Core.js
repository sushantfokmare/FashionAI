export async function InvokeLLM(prompt){
  // mock delay + response
  await new Promise(r => setTimeout(r, 600))
  return {
    text: `AI Suggestion based on: "${prompt}" -> Try a monochrome outfit with layered textures and chunky sneakers.`
  }
}

export async function UploadFile(file){
  await new Promise(r => setTimeout(r, 400))
  // return a mock url
  return { url: URL.createObjectURL(file) }
}
