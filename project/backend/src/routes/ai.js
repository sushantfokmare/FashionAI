/**
 * AI Service Routes
 * Proxy to Python AI service for fashion design generation
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Python AI service URL (configurable via .env)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * POST /api/ai/generate
 * Generate fashion design by forwarding request to Python service
 */
router.post('/generate', async (req, res) => {
  try {
    const { topwear, bottomwear, accessories, style, color_palette } = req.body;

    // Validate required fields
    if (!topwear || !bottomwear) {
      return res.status(400).json({ 
        message: 'Missing required fields: topwear and bottomwear are required' 
      });
    }

    // Forward request to Python AI service
    const response = await axios.post(`${AI_SERVICE_URL}/generate`, {
      topwear,
      bottomwear,
      accessories,
      style,
      color_palette
    }, {
      timeout: 10000, // 10 second timeout - just to submit job, not wait for completion
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });

    // Return job_id immediately (no URL transformation needed for job response)
    res.json(response.data);

  } catch (error) {
    console.error('AI Service error:', error.message);
    
    // Handle different error types
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return res.status(504).json({ 
        message: 'AI generation timed out. The process is taking longer than expected. Please try again or reduce complexity.' 
      });
    }
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        message: 'AI service is unavailable. Please ensure the Python service is running.' 
      });
    }

    if (error.response) {
      // Python service returned an error
      return res.status(error.response.status).json({ 
        message: error.response.data.detail || error.response.data.message || 'AI service error'
      });
    }

    // Generic error
    res.status(500).json({ 
      message: 'Failed to generate design. Please try again.' 
    });
  }
});

/**
 * GET /api/ai/generate/status/:job_id
 * Poll for generation job status
 */
router.get('/generate/status/:job_id', async (req, res) => {
  try {
    const { job_id } = req.params;

    const response = await axios.get(`${AI_SERVICE_URL}/generate/status/${job_id}`, {
      timeout: 5000,
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });

    const data = response.data;
    
    // Transform localhost image URLs in completed results
    if (data.status === 'completed' && data.result && data.result.image_url) {
      if (data.result.image_url.includes('localhost:8000/images/')) {
        const filename = data.result.image_url.split('/images/').pop();
        data.result.image_url = `/api/ai/images/${filename}`;
      }
    }

    res.json(data);

  } catch (error) {
    console.error('Job status error:', error.message);
    
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ 
        message: 'Job not found' 
      });
    }
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        message: 'AI service is unavailable' 
      });
    }

    res.status(500).json({ 
      message: 'Failed to check job status' 
    });
  }
});

/**
 * GET /api/ai/health
 * Check Python AI service health
 */
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, {
      timeout: 5000,
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    
    res.json({
      status: 'connected',
      ai_service: response.data
    });
  } catch (error) {
    res.status(503).json({
      status: 'disconnected',
      message: 'AI service is not available',
      ai_service_url: AI_SERVICE_URL
    });
  }
});

/**
 * GET /api/ai/images/list
 * List all generated images from Python service
 */
router.get('/images/list', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/images/list`, {
      timeout: 5000,
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    
    // Transform localhost URLs to use backend proxy
    const data = response.data;
    if (data.images && Array.isArray(data.images)) {
      data.images = data.images.map(img => {
        if (img.url && img.url.includes('localhost:8000/images/')) {
          const filename = img.url.split('/images/').pop();
          img.url = `/api/ai/images/${filename}`;
        }
        return img;
      });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Failed to fetch images:', error.message);
    res.status(503).json({ 
      message: 'Failed to fetch images from AI service' 
    });
  }
});

/**
 * POST /api/ai/restyle
 * Restyle an image using Stable Diffusion Image-to-Image
 */
router.post('/restyle', async (req, res) => {
  try {
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Forward the uploaded file
    if (!req.files || !req.files.image) {
      return res.status(400).json({ 
        message: 'No image file provided' 
      });
    }

    const imageFile = req.files.image;
    formData.append('image', imageFile.data, {
      filename: imageFile.name,
      contentType: imageFile.mimetype
    });
    
    // Forward other form data
    formData.append('prompt', req.body.prompt || 'fashion restyle');
    formData.append('strength', req.body.strength || '0.5');

    // Forward request to Python AI service
    const response = await axios.post(`${AI_SERVICE_URL}/restyle`, formData, {
      headers: { ...formData.getHeaders(), 'ngrok-skip-browser-warning': 'true' },
      timeout: 10000, // 10 second timeout - just to submit job
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    // Return job_id immediately
    res.json(response.data);

  } catch (error) {
    console.error('Restyle error:', error.message);
    
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return res.status(504).json({ 
        message: 'Restyle timed out. Please try again.' 
      });
    }
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        message: 'AI service is unavailable. Please ensure the Python service is running.' 
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({ 
        message: error.response.data.detail || 'Restyle failed'
      });
    }

    res.status(500).json({ 
      message: 'Failed to restyle image. Please try again.' 
    });
  }
});

/**
 * POST /api/ai/sketch-to-design
 * Convert sketch/drawing to realistic fashion design using Stable Diffusion
 */
router.post('/sketch-to-design', async (req, res) => {
  try {
    console.log('📝 Sketch-to-design request received');
    console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
    console.log('Body:', req.body);
    
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Validate uploaded file
    if (!req.files || !req.files.sketch) {
      console.error('❌ No sketch file in request');
      return res.status(400).json({ 
        message: 'No sketch file provided' 
      });
    }

    const sketchFile = req.files.sketch;
    console.log('✅ Sketch file received:', sketchFile.name, sketchFile.mimetype, sketchFile.size, 'bytes');
    
    formData.append('sketch', sketchFile.data, {
      filename: sketchFile.name,
      contentType: sketchFile.mimetype
    });
    
    // Forward other form data
    formData.append('prompt', req.body.prompt || 'professional fashion design, photorealistic');
    formData.append('strength', req.body.strength || '0.6');
    
    console.log('🚀 Forwarding to Python AI service:', `${AI_SERVICE_URL}/sketch-to-design`);

    // Forward request to Python AI service
    const response = await axios.post(`${AI_SERVICE_URL}/sketch-to-design`, formData, {
      headers: { ...formData.getHeaders(), 'ngrok-skip-browser-warning': 'true' },
      timeout: 10000, // 10 second timeout - just to submit job
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    // Return job_id immediately
    console.log('✅ Python service responded successfully');
    res.json(response.data);

  } catch (error) {
    console.error('❌ Sketch to design error:', error.message);
    if (error.response) {
      console.error('Python service error:', error.response.status, error.response.data);
    }
    
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return res.status(504).json({ 
        message: 'Sketch to design timed out. Please try again.' 
      });
    }
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        message: 'AI service is unavailable. Please ensure the Python service is running.' 
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({ 
        message: error.response.data.detail || 'Sketch to design conversion failed'
      });
    }

    res.status(500).json({ 
      message: 'Failed to convert sketch to design. Please try again.' 
    });
  }
});

/**
 * POST /api/ai/similar-designs
 * Search for similar fashion designs using text and/or image
 */
router.post('/similar-designs', async (req, res) => {
  try {
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Forward query text if provided
    if (req.body.query) {
      formData.append('query', req.body.query);
    }
    
    // Forward image file if provided
    if (req.files && req.files.image) {
      const imageFile = req.files.image;
      formData.append('image', imageFile.data, {
        filename: imageFile.name,
        contentType: imageFile.mimetype
      });
    }
    
    // Forward search parameters
    formData.append('topK', req.body.topK || '20');
    formData.append('textWeight', req.body.textWeight || '0.5');
    formData.append('includePalette', req.body.includePalette || 'true');
    formData.append('includeSilhouette', req.body.includeSilhouette || 'true');
    formData.append('includeTexture', req.body.includeTexture || 'true');

    console.log('🔍 Forwarding to Python AI service:', `${AI_SERVICE_URL}/similar-designs`);

    // Forward request to Python AI service
    const response = await axios.post(`${AI_SERVICE_URL}/similar-designs`, formData, {
      headers: { ...formData.getHeaders(), 'ngrok-skip-browser-warning': 'true' },
      timeout: 30000, // 30 second timeout
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('✅ Similarity search successful');
    res.json(response.data);

  } catch (error) {
    console.error('❌ Similar designs error:', error.message);
    if (error.response) {
      console.error('Python service error:', error.response.status, error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        message: 'AI service is unavailable. Please ensure the Python service is running.' 
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({ 
        message: error.response.data.detail || 'Similarity search failed'
      });
    }

    res.status(500).json({ 
      message: 'Failed to search for similar designs. Please try again.' 
    });
  }
});

/**
 * POST /api/ai/outfit-match
 * Match outfit items to uploaded image
 */
router.post('/outfit-match', async (req, res) => {
  try {
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Forward image file if provided
    if (req.files && req.files.file) {
      const imageFile = req.files.file;
      formData.append('file', imageFile.data, {
        filename: imageFile.name,
        contentType: imageFile.mimetype
      });
    }

    // Forward request to Python AI service
    const response = await axios.post(`${AI_SERVICE_URL}/recommend/image-outfit`, formData, {
      headers: { ...formData.getHeaders(), 'ngrok-skip-browser-warning': 'true' },
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    res.json(response.data);

  } catch (error) {
    console.error('Outfit match error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({ 
        message: error.response.data.detail || 'Outfit matching failed'
      });
    }
    res.status(500).json({ 
      message: 'Failed to match outfit. Please try again.' 
    });
  }
});

/**
 * POST /api/ai/occasion-styling
 * Generate outfit recommendations based on occasion and preferences
 */
router.post('/occasion-styling', async (req, res) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/occasion-styling`, req.body, {
      headers: { 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true' 
      },
      timeout: 30000
    });

    res.json(response.data);

  } catch (error) {
    console.error('Occasion styling error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({ 
        message: error.response.data.detail || 'Occasion styling failed'
      });
    }
    res.status(500).json({ 
      message: 'Failed to generate occasion outfits. Please try again.' 
    });
  }
});

/**
 * GET /api/ai/images/:filename
 * Proxy generated images from AI service
 */
router.get('/images/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const response = await axios.get(`${AI_SERVICE_URL}/images/${filename}`, {
      responseType: 'stream',
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    
    // Forward content type
    res.set('Content-Type', response.headers['content-type']);
    
    // Pipe image stream to response
    response.data.pipe(res);
  } catch (error) {
    console.error('Generated image proxy error:', error.message);
    res.status(404).json({ message: 'Image not found' });
  }
});

/**
 * GET /api/ai/dataset/images/:filename
 * Proxy dataset images from AI service
 */
router.get('/dataset/images/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const response = await axios.get(`${AI_SERVICE_URL}/dataset/images/${filename}`, {
      responseType: 'stream',
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    
    // Forward content type
    res.set('Content-Type', response.headers['content-type']);
    
    // Pipe image stream to response
    response.data.pipe(res);
  } catch (error) {
    console.error('Image proxy error:', error.message);
    res.status(404).json({ message: 'Image not found' });
  }
});

module.exports = router;
