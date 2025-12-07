import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  MapPin, 
  Filter, 
  Star, 
  CheckCircle, 
  Camera, 
  ChevronLeft, 
  ChevronRight,
  Send,
  Sparkles,
  MoreVertical,
  LogOut,
  TrendingUp,
  Eye,
  CreditCard,
  Search
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

import { UserRole, ViewState, Property, ChatSession, Message } from './types';
import { Button, Input, BottomNav, Badge } from './components/Shared';
import { generatePropertyDescription } from './services/gemini';

// --- MOCK DATA ---
const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Modern Loft in Downtown',
    price: 2500,
    period: 'month',
    location: 'Downtown, Metro City',
    type: 'Apartment',
    bedrooms: 1,
    bathrooms: 1,
    area: 850,
    description: 'A stunning open-concept loft with high ceilings and exposed brick walls. Located just steps away from the central station.',
    amenities: ['WiFi', 'Air Conditioning', 'Gym', 'Parking'],
    images: ['https://picsum.photos/800/600?random=1', 'https://picsum.photos/800/600?random=2'],
    ownerId: 'owner1',
    ownerName: 'Sarah Jenkins',
    rating: 4.8,
    reviewsCount: 12,
    isVerified: true,
    latitude: 40.7128,
    longitude: -74.0060
  },
  {
    id: '2',
    title: 'Cozy Family House with Garden',
    price: 4200,
    period: 'month',
    location: 'Green Valley, Suburbs',
    type: 'House',
    bedrooms: 3,
    bathrooms: 2,
    area: 2100,
    description: 'Perfect for families, this spacious home features a large backyard and a newly renovated kitchen.',
    amenities: ['Garden', 'Garage', 'Pet Friendly', 'Fireplace'],
    images: ['https://picsum.photos/800/600?random=3', 'https://picsum.photos/800/600?random=4'],
    ownerId: 'owner2',
    ownerName: 'Mike Ross',
    rating: 4.9,
    reviewsCount: 24,
    isVerified: true,
    latitude: 40.7580,
    longitude: -73.9855
  },
  {
    id: '3',
    title: 'Bright Studio near University',
    price: 1200,
    period: 'month',
    location: 'University District',
    type: 'Apartment',
    bedrooms: 0,
    bathrooms: 1,
    area: 400,
    description: 'Ideal for students. Compact, efficient, and close to campus. Includes all utilities.',
    amenities: ['Furnished', 'Utilities Included'],
    images: ['https://picsum.photos/800/600?random=5'],
    ownerId: 'owner3',
    ownerName: 'UniRentals',
    rating: 4.2,
    reviewsCount: 5,
    isVerified: false,
    latitude: 40.7328,
    longitude: -74.0200
  }
];

const MOCK_CHATS: ChatSession[] = [
  {
    id: 'c1',
    propertyId: '1',
    propertyName: 'Modern Loft in Downtown',
    propertyImage: 'https://picsum.photos/800/600?random=1',
    otherParticipantName: 'Sarah Jenkins',
    lastMessage: 'Is the apartment available for viewing this weekend?',
    lastMessageTime: Date.now() - 1000 * 60 * 30, // 30 mins ago
    unreadCount: 2
  },
  {
    id: 'c2',
    propertyId: '3',
    propertyName: 'Bright Studio',
    propertyImage: 'https://picsum.photos/800/600?random=5',
    otherParticipantName: 'UniRentals',
    lastMessage: 'Great, thanks for the info!',
    lastMessageTime: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    unreadCount: 0
  }
];

const ANALYTICS_DATA = [
  { name: 'Mon', views: 40, clicks: 24 },
  { name: 'Tue', views: 30, clicks: 13 },
  { name: 'Wed', views: 20, clicks: 8 },
  { name: 'Thu', views: 27, clicks: 19 },
  { name: 'Fri', views: 58, clicks: 35 },
  { name: 'Sat', views: 83, clicks: 42 },
  { name: 'Sun', views: 64, clicks: 38 },
];

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.ONBOARDING);
  const [role, setRole] = useState<UserRole>(UserRole.RENTER);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);

  // --- SUB-COMPONENTS (Defined here for file compactness) ---

  // 1. Onboarding
  const OnboardingView = () => (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-full h-64 bg-brand-50 rounded-3xl overflow-hidden mb-4 relative">
             <img src="https://picsum.photos/800/1000?random=10" className="object-cover w-full h-full opacity-90" alt="Home" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center p-6">
                 <h1 className="text-3xl font-bold text-white">RentLink</h1>
             </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Directly</h2>
          <p className="text-gray-500">Rent homes, offices, and shops directly from owners. No agents, no hidden fees.</p>
        </div>
      </div>
      <div className="p-8 pb-10 space-y-3">
        <Button fullWidth onClick={() => setView(ViewState.AUTH)}>Get Started</Button>
      </div>
    </div>
  );

  // 2. Auth
  const AuthView = () => (
    <div className="flex flex-col h-screen bg-white p-6 justify-center max-w-md mx-auto w-full">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-500">Sign in to continue</p>
      </div>
      <div className="space-y-4">
        <Input label="Email Address" value="" onChange={() => {}} placeholder="you@example.com" />
        <Input label="Password" type="password" value="" onChange={() => {}} placeholder="••••••••" />
        <Button fullWidth onClick={() => setView(ViewState.HOME)}>Sign In</Button>
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
        </div>
        <Button variant="outline" fullWidth onClick={() => setView(ViewState.HOME)}>Continue with Google</Button>
        <p className="text-center text-xs text-gray-400 mt-4">By signing in, you agree to our Terms & Privacy Policy.</p>
      </div>
    </div>
  );

  // 3. Home / Explore
  const HomeView = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("All");

    const filtered = properties.filter(p => 
      (filterType === "All" || p.type === filterType) && 
      (p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
      <div className="pb-24 bg-gray-50 min-h-screen">
        <div className="bg-white p-6 sticky top-0 z-10 shadow-sm rounded-b-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500 font-medium">Current Location</p>
              <div className="flex items-center text-brand-600 font-bold">
                <MapPin size={16} className="mr-1" />
                Dubai Marina, UAE
              </div>
            </div>
            <div className="h-10 w-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <img src="https://picsum.photos/100/100?random=user" alt="User" />
            </div>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by location or property..." 
              className="w-full bg-gray-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['All', 'Apartment', 'House', 'Office', 'Shop'].map(type => (
              <button 
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filterType === type ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Near You</h3>
            <button className="text-brand-600 text-xs font-semibold">See All</button>
          </div>

          <div className="grid gap-6">
            {filtered.map(property => (
              <div 
                key={property.id} 
                onClick={() => { setSelectedProperty(property); setView(ViewState.DETAILS); }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="relative h-48">
                  <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-800">
                    ${property.price}/{property.period}
                  </div>
                  {property.isVerified && (
                     <div className="absolute top-3 right-3 bg-brand-500/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-white flex items-center gap-1">
                        <CheckCircle size={10} /> Verified Listing
                     </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900 line-clamp-1">{property.title}</h4>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <MapPin size={12} className="mr-1" /> {property.location}
                      </p>
                    </div>
                    <div className="flex items-center text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                      <Star size={10} className="text-yellow-500 mr-1 fill-yellow-500" /> {property.rating}
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500 border-t border-gray-100 pt-3 mt-3">
                    {property.bedrooms > 0 && <span>{property.bedrooms} Beds</span>}
                    {property.bathrooms > 0 && <span>{property.bathrooms} Baths</span>}
                    <span>{property.area} sqft</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 4. Property Details
  const DetailsView = () => {
    const [currentImg, setCurrentImg] = useState(0);

    if (!selectedProperty) return null;

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedProperty.images.length > 0) {
            setCurrentImg((prev) => (prev + 1) % selectedProperty.images.length);
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedProperty.images.length > 0) {
            setCurrentImg((prev) => (prev - 1 + selectedProperty.images.length) % selectedProperty.images.length);
        }
    };

    return (
      <div className="bg-white min-h-screen pb-24">
        <div className="relative h-72 bg-gray-100 group">
          <img 
            src={selectedProperty.images[currentImg]} 
            alt="Property" 
            className="w-full h-full object-cover transition-opacity duration-300" 
          />
          
          <button 
            onClick={() => setView(ViewState.HOME)}
            className="absolute top-6 left-6 bg-white/50 backdrop-blur-md p-2 rounded-full hover:bg-white transition-colors z-20"
          >
            <ChevronLeft size={24} className="text-gray-900" />
          </button>

          {/* Carousel Controls */}
          {selectedProperty.images.length > 1 && (
            <>
                <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/50 transition-colors z-10"
                >
                    <ChevronLeft size={20} />
                </button>
                <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/50 transition-colors z-10"
                >
                    <ChevronRight size={20} />
                </button>
                
                {/* Dots */}
                <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2 z-10 pointer-events-none">
                    {selectedProperty.images.map((_, idx) => (
                        <div 
                            key={idx}
                            className={`h-1.5 rounded-full transition-all shadow-sm ${idx === currentImg ? 'w-6 bg-white' : 'w-1.5 bg-white/60'}`}
                        />
                    ))}
                </div>

                {/* Counter */}
                <div className="absolute bottom-12 right-6 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white z-10">
                    {currentImg + 1} / {selectedProperty.images.length}
                </div>
            </>
          )}
        </div>

        <div className="-mt-8 relative bg-white rounded-t-3xl p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
               <div className="flex gap-2 mb-2">
                  <Badge color="blue">{selectedProperty.type}</Badge>
                  {selectedProperty.isVerified && (
                    <Badge color="green">
                      <span className="flex items-center gap-1">
                        <CheckCircle size={10} /> Verified Listing
                      </span>
                    </Badge>
                  )}
               </div>
               <h1 className="text-2xl font-bold text-gray-900 mb-1">{selectedProperty.title}</h1>
               <p className="text-gray-500 flex items-center text-sm">
                 <MapPin size={14} className="mr-1" /> {selectedProperty.location}
               </p>
            </div>
          </div>

          <div className="flex justify-between items-center py-4 border-y border-gray-100">
             <div className="text-center w-1/3 border-r border-gray-100">
                <span className="block text-xl font-bold text-brand-600">${selectedProperty.price}</span>
                <span className="text-xs text-gray-400 uppercase">Per {selectedProperty.period}</span>
             </div>
             <div className="text-center w-1/3 border-r border-gray-100">
                <span className="block text-xl font-bold text-gray-800">{selectedProperty.area}</span>
                <span className="text-xs text-gray-400 uppercase">Sq Ft</span>
             </div>
             <div className="text-center w-1/3">
                <span className="block text-xl font-bold text-gray-800">{selectedProperty.bedrooms}</span>
                <span className="text-xs text-gray-400 uppercase">Bedrooms</span>
             </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {selectedProperty.description}
            </p>
          </div>

          <div>
             <h3 className="font-bold text-gray-900 mb-3">Amenities</h3>
             <div className="flex flex-wrap gap-2">
                {selectedProperty.amenities.map(am => (
                  <span key={am} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                    {am}
                  </span>
                ))}
             </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-3">Location</h3>
            <div className="h-40 bg-gray-200 rounded-xl flex items-center justify-center relative overflow-hidden">
               <img src="https://picsum.photos/800/400?blur=5" className="absolute inset-0 w-full h-full object-cover opacity-50" alt="map placeholder" />
               <Button variant="secondary" className="relative z-10 shadow-none pointer-events-none">View on Map</Button>
            </div>
          </div>
          
          <div className="h-4"></div> {/* Spacer */}
        </div>
        
        {/* Sticky Contact Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-xl flex gap-3 z-50 pb-8">
           <div className="flex items-center gap-3 flex-1">
              <img src={`https://ui-avatars.com/api/?name=${selectedProperty.ownerName}&background=random`} className="w-10 h-10 rounded-full" alt="owner" />
              <div className="flex-1">
                 <p className="text-xs text-gray-500">Listed by</p>
                 <p className="text-sm font-bold text-gray-900">{selectedProperty.ownerName}</p>
              </div>
           </div>
           <Button className="flex-1" onClick={() => setView(ViewState.CHAT_DETAIL)}>
              Chat Now
           </Button>
        </div>
      </div>
    );
  };

  // 5. Post Ad (Owner) - With Gemini Integration
  const PostAdView = () => {
    const [step, setStep] = useState(1);
    const [loadingAI, setLoadingAI] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        title: '',
        type: 'Apartment',
        price: '',
        location: '',
        bedrooms: '',
        description: '',
        highlights: '' // Input for AI
    });

    const handleGenerateDesc = async () => {
        if (!formData.type || !formData.location) {
            alert("Please fill in basic details first.");
            return;
        }
        setLoadingAI(true);
        const desc = await generatePropertyDescription({
            type: formData.type,
            location: formData.location,
            bedrooms: Number(formData.bedrooms) || 1,
            highlights: formData.highlights || "Modern, spacious, good view"
        });
        setFormData(prev => ({ ...prev, description: desc }));
        setLoadingAI(false);
    };

    const handlePublish = () => {
        const newProp: Property = {
            id: Date.now().toString(),
            title: formData.title || `${formData.bedrooms}-Bed ${formData.type}`,
            price: Number(formData.price),
            period: 'month',
            location: formData.location,
            type: formData.type as any,
            bedrooms: Number(formData.bedrooms),
            bathrooms: 1,
            area: 1000,
            description: formData.description,
            amenities: ['WiFi'],
            images: ['https://picsum.photos/800/600?random=new'],
            ownerId: 'me',
            ownerName: 'You',
            rating: 0,
            reviewsCount: 0,
            isVerified: true,
            latitude: 0,
            longitude: 0
        };
        setProperties([newProp, ...properties]);
        setView(ViewState.HOME);
    };

    return (
      <div className="bg-gray-50 min-h-screen pb-24 flex flex-col">
        <div className="bg-white p-4 sticky top-0 z-10 border-b border-gray-100 flex items-center justify-between">
             <button onClick={() => setView(ViewState.HOME)}><ChevronLeft /></button>
             <h2 className="font-bold">List Your Space</h2>
             <div className="w-6"></div>
        </div>

        <div className="p-6 flex-1">
          {step === 1 && (
              <div className="space-y-6">
                 <div>
                    <h3 className="text-lg font-bold mb-1">Basic Information</h3>
                    <p className="text-sm text-gray-500">Tell us about your property.</p>
                 </div>
                 
                 <div className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Property Type</label>
                        <div className="flex gap-2">
                           {['Apartment', 'House', 'Office', 'Shop'].map(t => (
                               <button 
                                key={t} 
                                onClick={() => setFormData({...formData, type: t})}
                                className={`flex-1 py-2 text-sm border rounded-lg ${formData.type === t ? 'bg-brand-50 border-brand-500 text-brand-700 font-medium' : 'bg-white border-gray-200'}`}
                               >
                                {t}
                               </button>
                           ))}
                        </div>
                    </div>
                    
                    <Input label="Property Title" placeholder="e.g. Sunset Apartment" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    <Input label="Location" placeholder="e.g. Downtown Dubai" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                    
                    <div className="flex gap-4">
                        <Input label="Price (Monthly)" type="number" placeholder="2500" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                        <Input label="Bedrooms" type="number" placeholder="2" value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: e.target.value})} />
                    </div>
                 </div>

                 <Button fullWidth onClick={() => setStep(2)}>Next Step</Button>
              </div>
          )}

          {step === 2 && (
              <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Details & Media</h3>
                    <p className="text-sm text-gray-500">Make it stand out.</p>
                 </div>

                 <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <label className="text-xs font-medium text-gray-500 mb-2 block">AI Assistant (Optional)</label>
                    <Input 
                        placeholder="Keywords: e.g. sunny, near metro, renovated..." 
                        value={formData.highlights} 
                        onChange={e => setFormData({...formData, highlights: e.target.value})} 
                    />
                    <button 
                        onClick={handleGenerateDesc}
                        disabled={loadingAI}
                        className="mt-3 w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
                    >
                        <Sparkles size={16} /> 
                        {loadingAI ? "Generating..." : "Generate Description with AI"}
                    </button>
                 </div>

                 <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide ml-1">Description</label>
                    <textarea 
                        className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl p-3 h-32 focus:ring-brand-500 focus:border-brand-500"
                        placeholder="Describe your property..."
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                 </div>

                 <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 gap-2 cursor-pointer hover:border-brand-500 hover:text-brand-500 transition-colors">
                    <Camera size={32} />
                    <span className="text-sm font-medium">Upload Photos</span>
                 </div>

                 <div className="flex gap-3">
                    <Button variant="ghost" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                    <Button fullWidth className="flex-[2]" onClick={handlePublish}>Publish Listing</Button>
                 </div>
              </div>
          )}
        </div>
      </div>
    );
  };

  // 6. Chat View
  const ChatView = () => (
    <div className="bg-white min-h-screen pb-24">
       <div className="p-6 pt-12 pb-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold">Messages</h2>
       </div>
       <div className="divide-y divide-gray-50">
          {MOCK_CHATS.map(chat => (
             <div 
                key={chat.id} 
                onClick={() => setView(ViewState.CHAT_DETAIL)}
                className="p-4 flex gap-4 hover:bg-gray-50 cursor-pointer active:bg-gray-100"
             >
                <div className="relative">
                   <img src={chat.propertyImage} className="w-14 h-14 rounded-xl object-cover" alt="prop" />
                   {chat.unreadCount > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between mb-1">
                      <h4 className="font-bold text-gray-900 truncate">{chat.otherParticipantName}</h4>
                      <span className="text-xs text-gray-400">2m ago</span>
                   </div>
                   <p className="text-xs text-gray-500 mb-1 truncate">{chat.propertyName}</p>
                   <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                      {chat.lastMessage}
                   </p>
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  // 7. Profile / Dashboard
  const ProfileView = () => {
    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            <div className="bg-white p-6 pt-12 rounded-b-3xl shadow-sm mb-6">
                <div className="flex items-center gap-4 mb-6">
                    <img src="https://picsum.photos/100/100?random=user" className="w-20 h-20 rounded-full border-4 border-gray-50" alt="profile" />
                    <div>
                        <h2 className="text-2xl font-bold">John Doe</h2>
                        <p className="text-gray-500 text-sm">Member since 2023</p>
                        <div className="flex gap-2 mt-2">
                             <Badge color="blue">{role}</Badge>
                             <Badge color="green">Verified</Badge>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setRole(UserRole.RENTER)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${role === UserRole.RENTER ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Renter Mode
                    </button>
                    <button 
                        onClick={() => setRole(UserRole.OWNER)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${role === UserRole.OWNER ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Owner Mode
                    </button>
                </div>
            </div>

            <div className="px-6 space-y-6">
                {role === UserRole.OWNER && (
                    <div className="bg-white p-5 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <TrendingUp size={18} className="text-brand-500"/> Performance
                            </h3>
                            <span className="text-xs text-gray-400">Last 7 Days</span>
                        </div>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={ANALYTICS_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                                    <Line type="monotone" dataKey="views" stroke="#22c55e" strokeWidth={3} dot={false} activeDot={{r: 4}} />
                                    <Line type="monotone" dataKey="clicks" stroke="#f97316" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    {[
                        { icon: <CreditCard size={20} />, label: 'Payments & Cards' },
                        { icon: <Star size={20} />, label: 'My Reviews' },
                        { icon: <CheckCircle size={20} />, label: 'Verification Status' },
                        { icon: <MoreVertical size={20} />, label: 'Settings' },
                        { icon: <LogOut size={20} />, label: 'Log Out', danger: true },
                    ].map((item, i) => (
                        <button key={i} className="w-full bg-white p-4 rounded-xl flex items-center gap-4 hover:bg-gray-50 transition-colors">
                            <div className={`p-2 rounded-lg ${item.danger ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600'}`}>
                                {item.icon}
                            </div>
                            <span className={`font-medium ${item.danger ? 'text-red-500' : 'text-gray-900'}`}>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
  };

  // --- MAIN RENDER ---
  return (
    <div className="max-w-lg mx-auto bg-gray-50 min-h-screen shadow-2xl overflow-hidden relative font-sans">
       {/* Simple Message Detail View Overlay */}
       {view === ViewState.CHAT_DETAIL && (
         <div className="fixed inset-0 z-50 bg-white flex flex-col max-w-lg mx-auto">
            <div className="p-4 border-b flex items-center gap-3">
               <button onClick={() => setView(ViewState.CHAT)}><ChevronLeft /></button>
               <div className="flex-1">
                  <h3 className="font-bold">Sarah Jenkins</h3>
                  <p className="text-xs text-green-500">Online</p>
               </div>
            </div>
            <div className="flex-1 bg-gray-50 p-4 space-y-4 overflow-y-auto">
               <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] text-sm">
                     Hi! Is the apartment still available?
                  </div>
               </div>
               <div className="flex justify-end">
                  <div className="bg-brand-500 text-white p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] text-sm">
                     Yes, it is! When would you like to view it?
                  </div>
               </div>
            </div>
            <div className="p-4 border-t bg-white flex gap-2">
               <input className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none" placeholder="Type a message..." />
               <button className="p-2 bg-brand-500 rounded-full text-white"><Send size={18}/></button>
            </div>
         </div>
       )}

       {view === ViewState.ONBOARDING && <OnboardingView />}
       {view === ViewState.AUTH && <AuthView />}
       {view === ViewState.HOME && <HomeView />}
       {view === ViewState.DETAILS && <DetailsView />}
       {view === ViewState.POST_AD && <PostAdView />}
       {view === ViewState.CHAT && <ChatView />}
       {view === ViewState.PROFILE && <ProfileView />}

       <BottomNav currentView={view} onChangeView={setView} />
    </div>
  );
}