import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function uploadToTmpFiles(formData: FormData) {
  const response = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  // Convert URL to download URL format
  const url = data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
  return url;
}

async function getImageDescription(imageUrl: string) {
  const response = await fetch(
    "https://hebed-workspace.onrender.com/api/v1/prediction/1ee6a47e-8ba8-4e95-8c1e-8289f5629cca",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: `Describe the following image url: ${imageUrl}`
      })
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to get image description');
  }
  
  const result = await response.json();
  return result.text || result.message || 'A professional product video';
}

async function generateVideo(imageUrl: string, description: string) {
  const LUMA_API_KEY = 'luma-d0cf1c1f-8c3a-44a2-ad0d-7492fc0790cc-c005fcc4-66f1-44b1-b0dd-89c1e3acd221';
  
  const response = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'authorization': `Bearer ${LUMA_API_KEY}`
    },
    body: JSON.stringify({
      aspect_ratio: '9:16',
      generation_type: 'video',
      prompt: description,
      keyframes: {
        frame0: { type: 'image', url: imageUrl }
      },
      model: 'ray-flash-2',
      duration: '5s'
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate video');
  }
  
  const data = await response.json();
  if (!data.id) {
    throw new Error('No video ID received from Luma API');
  }
  
  return data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    // Get image description
    const description = await getImageDescription(imageUrl);
    console.log('Image description:', description);

    // Generate video
    const videoGeneration = await generateVideo(imageUrl, description);
    console.log('Video generation started:', videoGeneration.id);

    return new Response(
      JSON.stringify({
        success: true,
        videoId: videoGeneration.id,
        description
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in process-video:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
});