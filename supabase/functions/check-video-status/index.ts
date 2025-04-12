import axios from 'npm:axios@1.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const videoId = url.searchParams.get('id');

    if (!videoId) {
      throw new Error('Video ID is required');
    }

    const API_KEY = '1cfedc23da39d430daeafbd6321e9984c';

    const options = {
      method: 'GET',
      url: `/api/aivideoapi/status?uuid=${videoId}`,
      headers: {
        accept: 'application/json',
        Authorization: API_KEY
      }
    };

    console.log('Checking video status for ID:', videoId);

    const response = await axios.request(options);
    console.log('Video status response:', response.data);

    return new Response(
      JSON.stringify({
        success: true,
        status: response.data.status,
        videoUrl: response.data.video_url
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in check-video-status:', error);
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