import axios from 'npm:axios@1.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageUrl, description } = await req.json();

    if (!imageUrl || !description) {
      throw new Error('Missing required parameters: imageUrl and description are required');
    }

    const API_KEY = '1cfedc23da39d430daeafbd6321e9984c';

    const options = {
      method: 'POST',
      url: '/api/aivideoapi/runway/generate/imageDescription',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: API_KEY
      },
      data: {
        text_prompt: description,
        model: 'gen3',
        flip: true,
        img_prompt: imageUrl
      }
    };

    console.log('Sending request to AI Video API:', {
      url: options.url,
      description,
      imageUrl
    });

    const response = await axios.request(options);
    console.log('AI Video API response:', response.data);

    return new Response(
      JSON.stringify(response.data),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});