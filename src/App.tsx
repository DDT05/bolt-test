import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Play, Upload, ChevronRight, Check, Clock, ArrowRight, Star } from 'lucide-react';
import { supabase } from './lib/supabase';
import { query } from './lib/flowise';
import toast, { Toaster } from 'react-hot-toast';
import { Checkout } from './pages/Checkout';
import { CheckoutSuccess } from './pages/CheckoutSuccess';
import { CheckoutCancel } from './pages/CheckoutCancel';

function AuthModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        
        if (error) throw error;
        toast.success('Check your email to confirm your account!');
        onClose();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        toast.success('Welcome back!');
        onClose();
      }
    } catch (error: any) {
      toast.error(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6">
          {authMode === 'signin' ? 'Sign In' : 'Create Account'}
        </h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            {authMode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [usedFreeTrial, setUsedFreeTrial] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const statusCheckInterval = useRef<number | null>(null);
  const lastCheckTime = useRef<Date | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setShowAuthModal(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setShowAuthModal(false);
    });

    return () => {
      subscription.unsubscribe();
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, []);

  const checkVideoStatus = async () => {
    if (!videoId) return;

    const currentTime = new Date();
    const timeSinceLastCheck = lastCheckTime.current 
      ? (currentTime.getTime() - lastCheckTime.current.getTime()) / 1000 
      : 0;
    
    console.log(`Checking video status at ${currentTime.toISOString()}`);
    console.log(`Time since last check: ${timeSinceLastCheck.toFixed(1)} seconds`);
    
    lastCheckTime.current = currentTime;

    try {
      console.log('Checking video status for ID:', videoId);
      const response = await fetch(`/api/aivideoapi/status?uuid=${videoId}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': import.meta.env.VITE_AI_VIDEO_API_KEY
        }
      });

      if (!response.ok) {
        console.error('Video status check failed:', response.status, response.statusText);
        throw new Error('Failed to check video status');
      }

      const data = await response.json();
      console.log('Video status response:', data);
      
      setVideoStatus(data.status);
      
      if (data.video_url) {
        console.log('Video URL received:', data.video_url);
        setVideoUrl(data.video_url);
        if (statusCheckInterval.current) {
          console.log('Clearing status check interval');
          clearInterval(statusCheckInterval.current);
          statusCheckInterval.current = null;
        }
        toast.success('Video generation completed!');
      } else {
        console.log('Current video status:', data.status);
      }
    } catch (error: any) {
      console.error('Error checking video status:', error);
      toast.error('Error checking video status');
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
      setSelectedImage(null);
      setVideoId(null);
      setVideoUrl(null);
      setVideoStatus('');
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
        statusCheckInterval.current = null;
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getImageDescription = async (imageUrl: string) => {
    try {
      console.log('Getting image description for URL:', imageUrl);
      const result = await query({
        question: `The mission is to describe the given url, describe an image as final output. Url is: ${imageUrl}`
      });
      console.log('Image description result:', result);
      return result.text || result.message || 'A professional product video';
    } catch (error) {
      console.error('Error getting image description:', error);
      return 'A professional product video with smooth transitions';
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (!session && usedFreeTrial) {
      setShowAuthModal(true);
      return;
    }

    try {
      setLoading(true);
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);

      if (!session) {
        setUsedFreeTrial(true);
      }

      console.log('Uploading image to tmpfiles.org');
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        console.error('Image upload failed:', uploadResponse.status, uploadResponse.statusText);
        throw new Error('Failed to upload image');
      }
      
      const uploadData = await uploadResponse.json();
      console.log('Image upload response:', uploadData);
      
      const downloadUrl = uploadData.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
      console.log('Image download URL:', downloadUrl);
      
      const imageDescription = await getImageDescription(downloadUrl);
      setDescription(imageDescription);
      console.log('Generated description:', imageDescription);

      const apiKey = import.meta.env.VITE_AI_VIDEO_API_KEY;
      if (!apiKey) {
        throw new Error('API key is not configured');
      }

      console.log('Calling AI Video API for video generation');
      const response = await fetch('/api/aivideoapi/runway/generate/imageDescription', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': apiKey
        },
        body: JSON.stringify({
          text_prompt: imageDescription,
          model: 'gen3',
          flip: true,
          img_prompt: downloadUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Video generation failed:', response.status, response.statusText, errorData);
        throw new Error(errorData.message || 'Failed to generate video');
      }

      const videoData = await response.json();
      console.log('Video API response:', videoData);
      
      if (videoData.uuid) {
        console.log('Video generation started with ID:', videoData.uuid);
        setVideoId(videoData.uuid);
        toast.success('Video generation started!');
        
        if (statusCheckInterval.current) {
          clearInterval(statusCheckInterval.current);
        }
        lastCheckTime.current = new Date();
        statusCheckInterval.current = setInterval(checkVideoStatus, 30000);
        checkVideoStatus();
      } else {
        throw new Error('No video ID received from Video API');
      }
    } catch (error: any) {
      console.error('Error processing image:', error);
      toast.error(`Error processing image: ${error.message}`);
      setSelectedImage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImageDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleStartFreeTrial = () => {
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Toaster position="top-right" />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      
      <Routes>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/checkout/cancel" element={<CheckoutCancel />} />
        <Route path="/" element={
          <>
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <Play className="w-8 h-8 text-blue-600" />
                    <span className="ml-2 text-xl font-bold text-gray-900">VideoSnap AI</span>
                  </div>
                  <div className="hidden md:flex items-center space-x-8">
                    <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
                    <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
                    <a href="#testimonials" className="text-gray-600 hover:text-gray-900">Testimonials</a>
                    {session ? (
                      <button
                        onClick={handleSignOut}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                      >
                        Sign Out
                      </button>
                    ) : (
                      <button
                        onClick={handleStartFreeTrial}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        Start Free Trial
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </nav>

            <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="bg-blue-50 rounded-full px-6 py-2 inline-flex items-center mb-8">
                  <Clock className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-blue-900 font-medium">Launch Special: First 500 users get 50% extra video credits - 43 spots remaining</span>
                </div>

                <div className="text-center">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                    Transform Static Product Images Into
                    <span className="text-blue-600"> Sales-Converting Videos</span>
                    <br />In Seconds
                  </h1>
                  <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                    Boost your conversion rates by up to 23% with AI-generated product videos.
                    No video editing skills required.
                  </p>

                  <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
                    <button
                      onClick={() => !session && setShowAuthModal(true)}
                      className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg font-medium"
                    >
                      Boost Your Sales With Video Now
                      <ChevronRight className="ml-2 w-5 h-5" />
                    </button>
                    <button className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition text-lg font-medium">
                      Watch Demo
                      <Play className="ml-2 w-5 h-5" />
                    </button>
                  </div>

                  <div
                    className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 border-2 border-dashed border-gray-200 cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleImageDrop}
                    onClick={handleUploadClick}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex flex-col items-center">
                      {selectedImage ? (
                        <div className="w-full max-w-md">
                          <img
                            src={selectedImage}
                            alt="Selected product"
                            className="w-full h-auto rounded-lg mb-4"
                          />
                          <div className="w-full bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>{videoUrl ? 'Video ready!' : videoStatus || 'Processing your video...'}</span>
                              {!videoUrl && (
                                <div className="animate-pulse bg-blue-100 h-2 w-48 rounded"></div>
                              )}
                            </div>
                            {description && (
                              <p className="mt-2 text-sm text-gray-600">Description: {description}</p>
                            )}
                            {videoUrl && (
                              <div className="mt-4">
                                <video
                                  src={videoUrl}
                                  controls
                                  className="w-full rounded-lg"
                                >
                                  Your browser does not support the video tag.
                                </video>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-blue-600 mb-4" />
                          <h3 className="text-xl font-semibold mb-2">
                            {session ? 'Drop your product image here' : 'Try it now - Drop your product image here'}
                          </h3>
                          <p className="text-gray-600 mb-6">or click to upload</p>
                          {(!session && usedFreeTrial) && (
                            <p className="text-sm text-blue-600 mb-4">
                              Sign up to continue generating videos!
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-12">
                    <p className="text-gray-500 mb-4">Trusted by 2,743+ e-commerce stores</p>
                    <div className="flex justify-center items-center space-x-8 opacity-50">
                      <img src="https://images.unsplash.com/photo-1622675363311-3e1904dc1885?auto=format&fit=crop&w=100&q=80" alt="Company logo" className="h-8" />
                      <img src="https://images.unsplash.com/photo-1622675363311-3e1904dc1885?auto=format&fit=crop&w=100&q=80" alt="Company logo" className="h-8" />
                      <img src="https://images.unsplash.com/photo-1622675363311-3e1904dc1885?auto=format&fit=crop&w=100&q=80" alt="Company logo" className="h-8" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-24 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-12">Loved by E-commerce Leaders</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-xl shadow-sm">
                    <div className="flex items-center mb-4">
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                        alt="Sarah Chen"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <h4 className="font-semibold">Sarah test</h4>
                        <p className="text-sm text-gray-600">Founder of StyleHub</p>
                      </div>
                    </div>
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600">"VideoSnap AI increased our conversion rate by 19% in the first month. The ROI is incredible."</p>
                  </div>

                  <div className="bg-white p-8 rounded-xl shadow-sm">
                    <div className="flex items-center mb-4">
                      <img
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80"
                        alt="Marcus Johnson"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <h4 className="font-semibold">Marcus Johnson</h4>
                        <p className="text-sm text-gray-600">Marketing Director at TechGadgets</p>
                      </div>
                    </div>
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600">"We've cut our video production costs by 78% while increasing engagement by 31%."</p>
                  </div>

                  <div className="bg-white p-8 rounded-xl shadow-sm">
                    <div className="flex items-center mb-4">
                      <img
                        src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=100&q=80"
                        alt="Jennifer Lopez"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <h4 className="font-semibold">Jennifer Lopez</h4>
                        <p className="text-sm text-gray-600">E-commerce Manager at BeautyEssentials</p>
                      </div>
                    </div>
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600">"Our product page bounce rate dropped by 42% after implementing these videos."</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-24 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
                  <p className="text-xl text-gray-600">Start free and scale as you grow</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-gray-100">
                    <h3 className="text-2xl font-bold mb-4">Starter</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">$29</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                      <li className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        <span>20 videos per month</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        <span>Basic templates</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        <span>Email support</span>
                      </li>
                    </ul>
                    <button
                      onClick={() => !session && setShowAuthModal(true)}
                      className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                    >
                      Start Free Trial
                    </button>
                  </div>

                  <div className="bg-white p-8 rounded-xl shadow-xl border-2 border-blue-600 relative">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                      Most Popular
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Business</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">$79</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                      <li className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        <span>100 videos per month</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        <span>Premium templates</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        <span>Priority support</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        <span>Custom branding</span>
                      </li>
                    </ul>
                    <button
                      onClick={() => !session && setShowAuthModal(true)}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Start Free Trial
                    </button>
                  </div>

                  <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-gray-100">
                    <h3 className="text-2xl font-bold mb-4">Agency</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">$199</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                      <li className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        <span>500 videos per month</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        <span>All premium features</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        <span>24/7 priority support</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        <span>API access</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        <span>White-label solution</span>
                      </li>
                    </ul>
                    <button
                      onClick={() => !session && setShowAuthModal(true)}
                      className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                    >
                      Start Free Trial
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        } />
      </Routes>
    </div>
  );
}

export default App;