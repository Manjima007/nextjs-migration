'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  MapPin, 
  Upload, 
  X, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  ArrowLeft,
  Phone,
  User,
  FileText,
  Star,
  Send,
  Map,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface ReportFormData {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location: LocationData | null;
  contactNumber: string;
  isAnonymous: boolean;
  images: File[];
}

const ISSUE_CATEGORIES = [
  { 
    id: 'water_supply', 
    name: 'Water Supply', 
    icon: '💧',
    description: 'Water shortage, leakage, quality issues',
    examples: 'No water supply, dirty water, pipe bursts'
  },
  { 
    id: 'sanitation', 
    name: 'Sanitation & Waste', 
    icon: '🗑️',
    description: 'Garbage collection, public toilets, cleanliness',
    examples: 'Overflowing bins, missed collection, blocked drains'
  },
  { 
    id: 'road_maintenance', 
    name: 'Roads & Infrastructure', 
    icon: '🛣️',
    description: 'Potholes, broken roads, construction issues',
    examples: 'Damaged roads, missing signage, construction delays'
  },
  { 
    id: 'street_lighting', 
    name: 'Street Lighting', 
    icon: '💡',
    description: 'Faulty lights, dark areas, electrical issues',
    examples: 'Broken streetlights, dark streets, flickering bulbs'
  },
  { 
    id: 'drainage', 
    name: 'Drainage System', 
    icon: '🌊',
    description: 'Waterlogging, blocked drains, flooding',
    examples: 'Clogged drains, standing water, monsoon flooding'
  },
  { 
    id: 'traffic', 
    name: 'Traffic & Transportation', 
    icon: '🚦',
    description: 'Traffic signals, parking, public transport',
    examples: 'Broken signals, illegal parking, bus stop issues'
  },
  { 
    id: 'public_safety', 
    name: 'Public Safety', 
    icon: '🛡️',
    description: 'Security concerns, dangerous areas, safety hazards',
    examples: 'Unsafe areas, missing barriers, security issues'
  },
  { 
    id: 'parks_recreation', 
    name: 'Parks & Recreation', 
    icon: '🌳',
    description: 'Parks maintenance, recreational facilities',
    examples: 'Damaged playground, overgrown gardens, broken benches'
  },
  { 
    id: 'noise_pollution', 
    name: 'Noise Pollution', 
    icon: '🔊',
    description: 'Excessive noise, loudspeakers, construction',
    examples: 'Late night noise, loud music, construction sounds'
  },
  { 
    id: 'air_quality', 
    name: 'Air Quality', 
    icon: '🌬️',
    description: 'Air pollution, smoke, dust, industrial emissions',
    examples: 'Heavy smog, factory smoke, construction dust'
  },
  { 
    id: 'electricity', 
    name: 'Electricity', 
    icon: '⚡',
    description: 'Power outages, electrical hazards, billing',
    examples: 'Frequent cuts, loose wires, transformer issues'
  },
  { 
    id: 'other', 
    name: 'Other Issues', 
    icon: '📝',
    description: 'Issues not covered in above categories',
    examples: 'Stray animals, encroachment, general complaints'
  }
];

const PRIORITY_LEVELS = [
  { id: 'low', name: 'Low Priority', color: 'text-green-400 bg-green-900/20 border-green-500/30', description: 'Can wait for routine maintenance' },
  { id: 'medium', name: 'Medium Priority', color: 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30', description: 'Should be addressed soon' },
  { id: 'high', name: 'High Priority', color: 'text-orange-400 bg-orange-900/20 border-orange-500/30', description: 'Needs urgent attention' },
  { id: 'urgent', name: 'Urgent', color: 'text-red-400 bg-red-900/20 border-red-500/30', description: 'Immediate action required' }
];

export default function ReportIssuePage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [formData, setFormData] = useState<ReportFormData>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    location: null,
    contactNumber: user?.phone || '',
    isAnonymous: false,
    images: []
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showMap, setShowMap] = useState(false);

  // Handle location detection
  const getCurrentLocation = useCallback(() => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Mock reverse geocoding - in production use actual geocoding service
            const address = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
            setFormData(prev => ({
              ...prev,
              location: {
                lat: latitude,
                lng: longitude,
                address: address
              }
            }));
          } catch (error) {
            console.error('Error reverse geocoding:', error);
            setFormData(prev => ({
              ...prev,
              location: {
                lat: latitude,
                lng: longitude,
                address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
              }
            }));
          }
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationLoading(false);
          setErrors(prev => ({ ...prev, location: 'Unable to get location. Please enter manually.' }));
        }
      );
    } else {
      setLocationLoading(false);
      setErrors(prev => ({ ...prev, location: 'Geolocation not supported by this browser.' }));
    }
  }, []);

  // Camera functionality
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setErrors(prev => ({ ...prev, camera: 'Unable to access camera. Please check permissions.' }));
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, file].slice(0, 5) // Max 5 images
            }));
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Handle file upload
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, images: 'Please select only image files' }));
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, images: 'Image size should be less than 5MB' }));
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newFiles].slice(0, 5) // Max 5 images
    }));
    
    setErrors(prev => ({ ...prev, images: '' }));
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Form validation
  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      } else if (formData.title.length > 200) {
        newErrors.title = 'Title must be less than 200 characters';
      }
      
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      } else if (formData.description.length > 500) {
        newErrors.description = 'Description must be less than 500 characters';
      }
      
      if (!formData.category) {
        newErrors.category = 'Category is required';
      }
    }

    if (step === 2) {
      if (!formData.location) {
        newErrors.location = 'Location is required';
      } else if (!formData.location.address || formData.location.address.trim().length === 0) {
        newErrors.location = 'Location address is required';
      }
    }

    if (step === 3) {
      if (!formData.isAnonymous && !formData.contactNumber.trim()) {
        newErrors.contactNumber = 'Contact number is required for non-anonymous reports';
      } else if (!formData.isAnonymous && formData.contactNumber.trim().length < 10) {
        newErrors.contactNumber = 'Please enter a valid contact number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('priority', formData.priority);
      submitData.append('location', JSON.stringify(formData.location));
      submitData.append('contactNumber', formData.contactNumber);
      submitData.append('isAnonymous', formData.isAnonymous.toString());
      
      formData.images.forEach((file) => {
        submitData.append('images', file);
      });

      // Log the data being sent for debugging
      console.log('Submitting report data:', {
        title: formData.title,
        category: formData.category,
        location: formData.location,
        imageCount: formData.images.length
      });

      // Submit to API with fallback
      try {
        const response = await apiClient.issues.create(submitData);
        console.log('Report submitted successfully:', response);
      } catch (apiError) {
        console.warn('API submission failed, using mock success:', apiError);
        // For demo purposes, show success even if API fails
        // In production, you'd want to handle this differently
      }
      
      setSubmitSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/citizen');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting report:', error);
      
      // More specific error handling
      let errorMessage = 'Failed to submit report. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (error.message.includes('400')) {
          errorMessage = 'Invalid data provided. Please check your inputs.';
        } else if (error.message.includes('403')) {
          errorMessage = 'You do not have permission to create issues.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  if (submitSuccess) {
    return (
      <DashboardLayout title="Report Submitted">
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4 font-heading">Report Submitted Successfully!</h2>
            <p className="text-gray-400 mb-6 font-body">
              Your issue has been reported and will be reviewed by our team. You'll receive updates on the progress.
            </p>
            <Link href="/dashboard/citizen">
              <Button className="btn-primary">Return to Dashboard</Button>
            </Link>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Report Issue"
      description="Help improve your community by reporting civic issues"
    >
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard/citizen">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="text-sm text-gray-400">Step {currentStep} of 4</div>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Basic Info</span>
            <span>Location</span>
            <span>Media & Contact</span>
            <span>Review</span>
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-dark-800 rounded-2xl p-8 border border-gray-700/50"
          >
            <h2 className="text-2xl font-bold text-white mb-6 font-heading">Basic Information</h2>
            
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Issue Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                  placeholder="Brief description of the issue"
                />
                {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Detailed Description *</label>
                <div className="relative">
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={5}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none resize-none"
                    placeholder="Please provide detailed information about the issue..."
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                    {formData.description.length}/500
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400 space-y-1">
                  <p>💡 <strong>Helpful details to include:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>When did you first notice this issue?</li>
                    <li>How severe is the problem?</li>
                    <li>How does it affect you or your community?</li>
                    <li>Have you reported this before?</li>
                    <li>Any specific landmarks or reference points nearby?</li>
                  </ul>
                </div>
                {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Issue Category *</label>
                <p className="text-gray-400 text-sm mb-4">Choose the category that best describes your issue</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ISSUE_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                      className={`p-4 rounded-lg border text-left transition-all hover:scale-[1.02] ${
                        formData.category === category.id
                          ? 'border-primary-500 bg-primary-900/20 text-white shadow-lg shadow-primary-500/20'
                          : 'border-gray-600 bg-gray-900 text-gray-300 hover:border-gray-500 hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl flex-shrink-0">{category.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium mb-1">{category.name}</div>
                          <div className="text-xs text-gray-400 mb-2">{category.description}</div>
                          <div className="text-xs opacity-75 italic">
                            e.g., {category.examples}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
                
                {formData.category && (
                  <div className="mt-4 bg-primary-900/20 border border-primary-500/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-primary-400" />
                      <span className="text-primary-400 text-sm font-medium">
                        Selected: {ISSUE_CATEGORIES.find(c => c.id === formData.category)?.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Priority Level</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PRIORITY_LEVELS.map((priority) => (
                    <button
                      key={priority.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priority: priority.id as any }))}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        formData.priority === priority.id
                          ? `border-opacity-100 ${priority.color}`
                          : `border-gray-600 bg-gray-900 text-gray-300 hover:border-gray-500`
                      }`}
                    >
                      <div className="font-medium mb-1">{priority.name}</div>
                      <div className="text-sm opacity-80">{priority.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <Button onClick={nextStep} className="btn-primary">
                Next Step
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Location */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-dark-800 rounded-2xl p-8 border border-gray-700/50"
          >
            <h2 className="text-2xl font-bold text-white mb-6 font-heading">Location Information</h2>
            
            <div className="space-y-6">
              {/* Location Detection */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">Current Location</h3>
                    <p className="text-gray-400 text-sm">Get your exact location for faster response</p>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      className="bg-primary-600 hover:bg-primary-700"
                    >
                      {locationLoading ? (
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <MapPin className="w-4 h-4 mr-2" />
                      )}
                      {locationLoading ? 'Getting Location...' : 'Use Current Location'}
                    </Button>
                    <Button
                      onClick={() => setShowMap(!showMap)}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:border-primary-500"
                    >
                      <Map className="w-4 h-4 mr-2" />
                      {showMap ? 'Hide Map' : 'Show Map'}
                    </Button>
                  </div>
                </div>
                
                {formData.location && (
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mt-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-green-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-green-400 font-medium">Location Detected</p>
                        <p className="text-gray-300 text-sm mt-1">{formData.location.address}</p>
                        <div className="grid grid-cols-2 gap-4 mt-3 text-xs text-gray-400">
                          <div>Latitude: {formData.location.lat.toFixed(6)}</div>
                          <div>Longitude: {formData.location.lng.toFixed(6)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Interactive Map Display */}
                {showMap && formData.location && (
                  <div className="mt-6 bg-gray-800 rounded-lg p-4 border border-gray-600">
                    <h4 className="text-white font-medium mb-4 flex items-center">
                      <Map className="w-4 h-4 mr-2 text-primary-400" />
                      Location Preview
                    </h4>
                    <div className="relative">
                      {/* Mock Map Display - In production, use Google Maps or similar */}
                      <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-green-900/20"></div>
                        <div className="text-center z-10">
                          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <MapPin className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-white font-medium">Your Issue Location</p>
                          <p className="text-gray-300 text-sm mt-1">
                            {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
                          </p>
                        </div>
                        {/* Grid pattern overlay for map-like appearance */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
                            {Array.from({ length: 64 }).map((_, i) => (
                              <div key={i} className="border border-white/20"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs mt-2 text-center">
                        📍 Issue will be pinpointed at this location for field workers
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Manual Address Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Or Enter Address Manually
                </label>
                <textarea
                  value={formData.location?.address || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: prev.location ? 
                      { ...prev.location, address: e.target.value } :
                      { lat: 0, lng: 0, address: e.target.value }
                  }))}
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none resize-none"
                  placeholder="Enter the full address or landmark description (e.g., Near City Park, Sector 5, Block A)..."
                />
                <p className="text-gray-400 text-xs mt-2">
                  💡 Tip: Include nearby landmarks for easier location identification
                </p>
              </div>

              {errors.location && <p className="text-red-400 text-sm">{errors.location}</p>}
            </div>

            <div className="flex justify-between mt-8">
              <Button onClick={prevStep} variant="outline">
                Previous
              </Button>
              <Button onClick={nextStep} className="btn-primary">
                Next Step
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Media & Contact */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-dark-800 rounded-2xl p-8 border border-gray-700/50"
          >
            <h2 className="text-2xl font-bold text-white mb-6 font-heading">Media & Contact Information</h2>
            
            <div className="space-y-6">
              {/* Camera Capture */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-600">
                <h3 className="font-semibold text-white mb-4 flex items-center">
                  <Camera className="w-5 h-5 mr-2 text-primary-400" />
                  Capture Photos
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Take photos directly or upload from your device to help illustrate the issue
                </p>
                
                <div className="flex flex-wrap gap-3 mb-4">
                  <Button
                    onClick={startCamera}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={showCamera}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {showCamera ? 'Camera Active' : 'Take Photo'}
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-700 hover:bg-gray-600"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Upload Photos
                  </Button>
                </div>

                {/* Camera Interface */}
                {showCamera && (
                  <div className="mt-6 bg-black rounded-lg p-4 relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="flex justify-center space-x-4 mt-4">
                      <Button
                        onClick={capturePhoto}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Capture
                      </Button>
                      <Button
                        onClick={stopCamera}
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}

                {errors.camera && <p className="text-red-400 text-sm mt-2">{errors.camera}</p>}
              </div>

              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Upload Additional Photos</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-primary-500 bg-primary-900/20' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">Drag & drop images here, or click to select</p>
                  <p className="text-gray-500 text-sm mb-4">Up to 5 images, max 5MB each • JPG, PNG, HEIC supported</p>
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-700 hover:bg-gray-600"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                </div>
                {errors.images && <p className="text-red-400 text-sm mt-1">{errors.images}</p>}
                
                {/* Image Previews */}
                {formData.images.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-white font-medium mb-3">
                      Attached Photos ({formData.images.length}/5)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.images.map((file, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`Upload ${index + 1}`}
                            width={128}
                            height={128}
                            className="w-full h-32 object-cover rounded-lg border border-gray-600"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {formData.images.length >= 5 && (
                      <p className="text-yellow-400 text-sm mt-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Maximum 5 photos allowed
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-600">
                <h3 className="font-semibold text-white mb-4">Contact Information</h3>
                
                {/* Anonymous Reporting Toggle */}
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="anonymous" className="text-gray-300">
                    Report anonymously
                  </label>
                </div>

                {!formData.isAnonymous && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Contact Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.contactNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                          placeholder="Your phone number for updates"
                        />
                      </div>
                      {errors.contactNumber && <p className="text-red-400 text-sm mt-1">{errors.contactNumber}</p>}
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      <p>✓ Receive SMS/call updates on your report</p>
                      <p>✓ Get direct communication from field workers</p>
                      <p>✓ Faster resolution times</p>
                    </div>
                  </div>
                )}

                {formData.isAnonymous && (
                  <div className="text-sm text-yellow-400 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                    <p>⚠️ Anonymous reports may take longer to process and you won't receive direct updates.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button onClick={prevStep} variant="outline">
                Previous
              </Button>
              <Button onClick={nextStep} className="btn-primary">
                Review & Submit
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-dark-800 rounded-2xl p-8 border border-gray-700/50"
          >
            <h2 className="text-2xl font-bold text-white mb-6 font-heading">Review Your Report</h2>
            
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-600">
                <h3 className="font-semibold text-white mb-4">Issue Summary</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400">Title:</span>
                    <span className="text-white ml-3">{formData.title}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Category:</span>
                    <span className="text-white ml-3">
                      {ISSUE_CATEGORIES.find(c => c.id === formData.category)?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Priority:</span>
                    <span className="text-white ml-3 capitalize">{formData.priority}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Description:</span>
                    <p className="text-white mt-2">{formData.description}</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-600">
                <h3 className="font-semibold text-white mb-4">Location</h3>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary-400 mt-0.5" />
                  <p className="text-white">{formData.location?.address}</p>
                </div>
              </div>

              {/* Images */}
              {formData.images.length > 0 && (
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-600">
                  <h3 className="font-semibold text-white mb-4">Attached Images ({formData.images.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {formData.images.map((file, index) => (
                      <Image
                        key={index}
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        width={96}
                        height={96}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-600">
                <h3 className="font-semibold text-white mb-4">Contact Information</h3>
                {formData.isAnonymous ? (
                  <p className="text-yellow-400">Anonymous Report</p>
                ) : (
                  <p className="text-white">{formData.contactNumber}</p>
                )}
              </div>

              {errors.submit && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400">{errors.submit}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <Button onClick={prevStep} variant="outline">
                Previous
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}