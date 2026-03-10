export type UserRole = 'user' | 'trainer' | 'admin';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type SubscriptionPlan = 'free' | 'basic' | 'pro';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';
export type NotificationType = 'booking' | 'payment' | 'system' | 'reminder';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Trainer {
  id: string;
  user_id: string;
  bio: string | null;
  specialization: string[];
  rating: number;
  total_reviews: number;
  created_at: string;
}

export interface Class {
  id: string;
  trainer_id: string;
  title: string;
  description: string | null;
  capacity: number;
  duration_min: number;
  scheduled_at: string;
  location: string | null;
  is_cancelled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  class_id: string;
  status: BookingStatus;
  qr_token: string;
  checked_in: boolean;
  created_at: string;
  updated_at: string;
}
