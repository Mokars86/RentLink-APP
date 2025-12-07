export enum UserRole {
  RENTER = 'RENTER',
  OWNER = 'OWNER'
}

export enum ViewState {
  SPLASH = 'SPLASH',
  ONBOARDING = 'ONBOARDING',
  AUTH = 'AUTH',
  HOME = 'HOME',
  DETAILS = 'DETAILS',
  POST_AD = 'POST_AD',
  CHAT = 'CHAT',
  CHAT_DETAIL = 'CHAT_DETAIL',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
  PAYMENTS = 'PAYMENTS',
  SUPPORT = 'SUPPORT'
}

export interface Property {
  id: string;
  title: string;
  price: number;
  period: 'month' | 'year';
  location: string;
  type: 'Apartment' | 'House' | 'Office' | 'Shop';
  bedrooms: number;
  bathrooms: number;
  area: number; // sqft
  description: string;
  amenities: string[];
  images: string[];
  ownerId: string;
  ownerName: string;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  latitude: number;
  longitude: number;
  views?: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  email: string;
  verified: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface ChatSession {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyImage: string;
  otherParticipantName: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
}