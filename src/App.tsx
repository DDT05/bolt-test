import React, { useState, useRef, useEffect } from 'react';
import { Play, Upload, Star, Check, X } from 'lucide-react';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

async function uploadToTmpFiles(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const data = await response.json();
    
    const match = data.data.url.match(/(\d+)\/([^/]+)$/);
    if (!match) {
      throw new Error('Failed to parse upload response URL');
    }

    const [, id] = match;
    const downloadUrl = `https://tmpfiles.org/dl/${id}/${file.name}`;
    
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading to tmpfiles.org:', error);
    throw error;
  }
}

function App() {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [flowiseResponse, setFlowiseResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [videoUuid, setVideoUuid] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const statusCheckIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
      setApiResponse(null);
      setFlowiseResponse(null);
      setVideoStatus(null);
      setVideoUuid(null);
      setVideoUrl(null);
      setGifUrl(null);
      setProgress(0);
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
    };
    reader.readAsDataURL(file);
  };

  const clearPreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewImage(null);
    setApiResponse(null);
    setFlowiseResponse(null);
    setUploadedFile(null);
    setVideoStatus(null);
    setVideoUuid(null);
    setVideoUrl(null);
    setGifUrl(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }
  };

  const improveDescription = async (description: string) => {
    try {
      console.log('Sending description to Flowise:', description);
      const response = await fetch('https://hebed-workspace.onrender.com/api/v1/prediction/1ee6a47e-8ba8-4e95-8c1e-8289f5629cca', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: description }),
      });

      if (!response.ok) {
        throw new Error(`Flowise API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Flowise response:', result);
      const responseText = result?.text || result?.question || JSON.stringify(result);
      setFlowiseResponse(responseText);
      return responseText;
    } catch (error) {
      console.error('Error improving description:', error);
      return description;
    }
  };

  const checkVideoStatus = async (uuid: string) => {
    const url = `https://runwayml.p.rapidapi.com/status?uuid=${uuid}`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': import.meta.env.VITE_RAPIDAPI_KEY,
        'x-rapidapi-host': 'runwayml.p.rapidapi.com'
      }
    };

    try {
      const now = new Date().toLocaleTimeString();
      console.log(`[${now}] Checking video status for UUID: ${uuid}`);
      const response = await fetch(url, options);
      const result = await response.text();
      console.log(`[${now}] Video status result:`, result);
      
      const status = JSON.parse(result);
      setVideoStatus(result);

      if (status.progress !== undefined) {
        setProgress(status.progress * 100);
      }

      if (status.url) {
        setVideoUrl(status.url);
      } else if (status.video_url) {
        setVideoUrl(status.video_url);
      }

      if (status.gif_url) {
        setGifUrl(status.gif_url);
      }

      if (
        status.status === 'success' ||
        status.progress === 1 ||
        status.state === 'completed'
      ) {
        console.log(`[${now}] Video processing completed.`);
        setProgress(100);
        if (statusCheckIntervalRef.current) {
          clearInterval(statusCheckIntervalRef.current);
          statusCheckIntervalRef.current = null;
        }
      } else if (status.state === 'failed') {
        console.log(`[${now}] Video processing failed`);
        if (statusCheckIntervalRef.current) {
          clearInterval(statusCheckIntervalRef.current);
          statusCheckIntervalRef.current = null;
        }
      } else {
        console.log(`[${now}] Video still processing. Progress: ${status.progress * 100}%`);
      }
    } catch (error) {
      const now = new Date().toLocaleTimeString();
      console.error(`[${now}] Error checking video status:`, error);
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
    }
  };

  const startStatusChecking = (uuid: string) => {
    const now = new Date().toLocaleTimeString();
    console.log(`[${now}] Starting status checks for UUID: ${uuid}`);
    
    if (statusCheckIntervalRef.current) {
      console.log(`[${now}] Clearing existing status check interval`);
      clearInterval(statusCheckIntervalRef.current);
    }

    setProgress(0);

    console.log(`[${now}] Performing initial status check`);
    checkVideoStatus(uuid);

    console.log(`[${now}] Setting up 30-second interval for status checks`);
    statusCheckIntervalRef.current = window.setInterval(() => {
      checkVideoStatus(uuid);
    }, 30000);
  };

  const handleDownload = (url: string | null, type: 'mp4' | 'gif') => {
    if (!url) {
      console.error(`No ${type} URL available`);
      return;
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = `video.${type}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateVideo = async (description: string, imageFile: File) => {
    const url = 'https://runwayml.p.rapidapi.com/generate/imageDescription';
    
    const textPrompt = typeof description === 'object' ? JSON.stringify(description) : String(description);
    
    try {
      const imageUrl = await uploadToTmpFiles(imageFile);
      console.log('Image uploaded, download URL:', imageUrl);

      const options = {
        method: 'POST',
        headers: {
          'x-rapidapi-key': import.meta.env.VITE_RAPIDAPI_KEY,
          'x-rapidapi-host': 'runwayml.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text_prompt: textPrompt,
          img_prompt: imageUrl,
          model: 'gen3',
          image_as_end_frame: false,
          flip: true,
          motion: 5,
          seed: 0,
          callback_url: '',
          time: 10
        })
      };

      console.log('Generating video with description:', textPrompt);
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Video generation error:', errorData);
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.text();
      console.log('Video generation result:', result);
      
      const { uuid } = JSON.parse(result);
      if (uuid) {
        setVideoUuid(uuid);
        startStatusChecking(uuid);
      }
    } catch (error) {
      console.error('Error generating video:', error);
      setVideoStatus('Failed to generate video. Please try again.');
    }
  };

  const handleConversion = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!uploadedFile || !previewImage) return;

    setIsLoading(true);
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "What does this image show?" },
              {
                type: "image_url",
                image_url: {
                  url: previewImage,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 500
      });

      const initialDescription = completion.choices[0].message.content;
      setApiResponse(initialDescription);
      console.log('OpenAI response:', initialDescription);

      const improvedDescription = await improveDescription(initialDescription || '');
      
      if (improvedDescription) {
        await generateVideo(improvedDescription, uploadedFile);
      }
    } catch (error) {
      console.error('Error:', error);
      setApiResponse('Failed to process image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-purple-900 py-4 px-6">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Play className="text-purple-200" size={24} />
            <span className="text-white text-xl font-bold">VideoSnap AI</span>
          </div>
        </nav>
      </header>

      <main className="flex-grow bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-8 bg-purple-100 p-3 rounded-full inline-block mx-auto animate-fade-in">
            <p className="text-purple-700">
              <span className="font-semibold">Launch Special:</span> First 500 users get 50% extra video credits - 43 spots remaining
            </p>
          </div>

          <div className="text-center mb-16 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <h1 className="text-5xl font-bold mb-6">
              Transform Static Product Images Into{' '}
              <span className="text-gradient">Sales-Converting Videos</span>
              <br />In Seconds
            </h1>
            <p className="text-purple-800 text-xl mb-8">
              Boost your conversion rates by up to 23% with AI-generated product videos.
              <br />No video editing skills required.
            </p>
          </div>

          <div className="max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.4s'}}>
            <div 
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors duration-300 bg-white cursor-pointer
                ${isDragging ? 'border-purple-600 bg-purple-50' : 'border-purple-200 hover:border-purple-400'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                accept="image/*"
                className="hidden"
              />
              
              {previewImage ? (
                <div className="relative" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={clearPreview}
                    className="absolute -top-4 -right-4 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg shadow-lg"
                  />
                  <button 
                    className={`btn-primary mt-6 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleConversion}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Generate Video'}
                  </button>
                  
                  {apiResponse && (
                    <div className="mt-6 p-4 bg-purple-50 rounded-lg text-left">
                      <h4 className="font-semibold text-purple-900 mb-2">Initial Description:</h4>
                      <p className="text-purple-800 whitespace-pre-wrap">{apiResponse}</p>
                    </div>
                  )}

                  {flowiseResponse && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg text-left">
                      <h4 className="font-semibold text-green-900 mb-2">Improved Description:</h4>
                      <p className="text-green-800 whitespace-pre-wrap">{flowiseResponse}</p>
                    </div>
                  )}

                  {videoStatus && (
                    <div className="mt-6 bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Video Status</h3>
                      
                      {(() => {
                        try {
                          const statusData = JSON.parse(videoStatus);
                          return (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="font-medium text-gray-700">UUID</span>
                                <span className="font-mono text-sm text-gray-600">{statusData.uuid}</span>
                              </div>
                              
                              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="font-medium text-gray-700">Status</span>
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                  statusData.status === 'success' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {statusData.status}
                                </span>
                              </div>

                              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="font-medium text-gray-700">Progress</span>
                                <div className="flex items-center">
                                  <div className="w-48 bg-gray-200 rounded-full h-2 mr-3">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {Math.round(progress)}%
                                  </span>
                                  <span className="ml-3 text-sm text-gray-500">
                                    Query submitted successfully. Due to high demand, processing may take a few minutes.
                                  </span>
                                </div>
                              </div>

                              {videoUrl && (
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                  <span className="font-medium text-gray-700">MP4 URL</span>
                                  <button 
                                    onClick={() => handleDownload(videoUrl, 'mp4')}
                                    className="text-blue-600 hover:text-blue-700 text-sm underline"
                                  >
                                    Download MP4
                                  </button>
                                </div>
                              )}

                              {gifUrl && (
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                  <span className="font-medium text-gray-700">GIF URL</span>
                                  <button 
                                    onClick={() => handleDownload(gifUrl, 'gif')}
                                    className="text-blue-600 hover:text-blue-700 text-sm underline"
                                  >
                                    Download GIF
                                  </button>
                                </div>
                              )}

                              {(statusData.status === 'success' || statusData.progress === 1) && (
                                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
                                  <div className="flex items-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                                      <Check className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-green-900">Video Generated Successfully!</h4>
                                      <p className="text-green-700 text-sm mt-1">
                                        Your video is ready to download in both MP4 and GIF formats
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-4 flex space-x-3">
                                    <button
                                      onClick={() => handleDownload(videoUrl, 'mp4')}
                                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center"
                                    >
                                      Download MP4
                                    </button>
                                    <button
                                      onClick={() => handleDownload(gifUrl, 'gif')}
                                      className="flex-1 bg-white text-green-600 px-4 py-2 rounded-lg border border-green-200 hover:bg-green-50 transition-colors text-center"
                                    >
                                      Download GIF
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        } catch (e) {
                          return (
                            <div className="text-gray-600 whitespace-pre-wrap">
                              {videoStatus}
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Upload className="mx-auto mb-4 text-purple-400" size={48} />
                  <h3 className="text-xl font-semibold mb-2 text-purple-900">
                    Try it now - Drop your product image here
                  </h3>
                  <p className="text-purple-600">or click to upload</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-purple-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12 text-purple-900">Loved by E-commerce Leaders</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Mckeen",
                  photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
                  quote: "VideoSnap AI increased our conversion rate by 19% in the first month. The ROI is incredible."
                },
                {
                  name: "Marcus Denoy",
                  photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop",
                  quote: "We've cut our video production costs by 78% while increasing engagement by 31%."
                },
                {
                  name: "Jennifer Finrech",
                  photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop",
                  quote: "Our product page bounce rate dropped by 42% after implementing these videos."
                }
              ].map((testimonial, i) => (
                <div 
                  key={i}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in"
                  style={{animationDelay: `${0.2 * i}s`}}
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.photo}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <h4 className="font-semibold text-purple-900">{testimonial.name}</h4>
                  </div>
                  <div className="flex mb-4">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="text-purple-400 fill-current" size={20} />
                    ))}
                  </div>
                  <p className="text-purple-800">{testimonial.quote}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-4 text-purple-900">Simple, Transparent Pricing</h2>
            <p className="text-center text-purple-600 mb-12">Subscribe and scale as you grow</p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "BASIC",
                  price: "39.90",
                  features: ["50 videos per month", "Basic templates", "Email support"],
                  url: "https://buy.stripe.com/4gwdSU6cOg6TfK03cf"
                },
                {
                  name: "PRO",
                  price: "79.90",
                  popular: true,
                  features: ["250 videos per month", "Premium templates", "Priority support", "Custom branding"],
                  url: "https://buy.stripe.com/3csdSU30Cf2P41ieUY"
                },
                {
                  name: "MEGA",
                  price: "119.90",
                  features: ["750 videos per month", "All premium features", "24/7 priority support", "API access", "White-label solution"],
                  url: "https://buy.stripe.com/14kbKMdFg6wj2XebIN"
                }
              ].map((plan, i) => (
                <div 
                  key={i}
                  className={`pricing-card relative ${plan.popular ? 'border-purple-400 shadow-lg' : ''}`}
                  style={{animationDelay: `${0.2 * i}s`}}
                >
                  {plan.popular && (
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm absolute -top-3 right-4">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-semibold mb-2 text-purple-900">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-purple-900">${plan.price}</span>
                    <span className="text-purple-600">/month</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center">
                        <Check className="text-purple-500 mr-2" size={20} />
                        <span className="text-purple-800">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    className={`w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => window.location.href = plan.url}
                  >
                    Subscribe
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-purple-900 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-2">
              <Play size={20} className="text-purple-200" />
              <span className="font-semibold">VideoSnap AI</span>
            </div>
            <div className="flex space-x-6">
              <a href="/privacy" className="text-purple-200 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-purple-200 hover:text-white transition-colors">
                Terms of Use
              </a>
              <a href="/refund" className="text-purple-200 hover:text-white transition-colors">
                Refund Policy
              </a>
            </div>
          </div>
          
          <div className="border-t border-purple-800 pt-8">
            <div className="text-sm text-purple-300 space-y-4">
              <p className="mb-4">Questions? Contact us at contact.hebedai@gmail.com</p>
              
              <p className="mb-4">
                This website uses cookies to analyze and improve user experience. 
                By using this website, you expressly consent to the processing of your data 
                by our software under the conditions and for the purposes described above.
              </p>
              
              <p className="mb-4">
                For more information, please consult our Terms of Service
              </p>
              
              <p>
                This website is not part of the Facebook website or Facebook Inc.
                Additionally, this site is NOT endorsed by Facebook in any way.
                FACEBOOK is a trademark of Facebook, Inc.
              </p>
              
              <p className="mt-6">
                © 2024 VideoSnap AI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;