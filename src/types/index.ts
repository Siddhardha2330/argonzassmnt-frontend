export interface User {
  _id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string;
  role: 'student' | 'mentor' | 'admin' | 'developer' | 'designer';
  expertise_areas: string[];
  bio: string;
  contact_info: {
    phone: string;
    location: string;
    website: string;
  };
  settings: {
    theme: 'light' | 'dark';
    notifications_enabled: boolean;
    language: string;
    timezone: string;
  };
  mentor_profile?: {
    is_verified: boolean;
    hourly_rate: number;
    availability: Array<{
      day: string;
      start_time: string;
      end_time: string;
    }>;
    languages: string[];
    education: Array<{
      institution: string;
      degree: string;
      field: string;
      year: number;
    }>;
    experience: Array<{
      company: string;
      position: string;
      duration: string;
      description: string;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      year: number;
      expiry_date: Date;
    }>;
  };
  created_at: Date;
  updated_at: Date;
}

export interface MentorProfile {
  _id: string;
  user_id: string;
  profession: string;
  specialization: string;
  bio: string;
  company: string;
  position: string;
  location: string;
  hourly_rate: number;
  currency: string;
  availability_status: 'available' | 'busy' | 'unavailable';
  total_tasks_completed: number;
  total_reviews: number;
  average_rating: number;
  total_followers: number;
  is_featured: boolean;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  deadline: Date;
  estimated_time: {
    hours: number;
    minutes: number;
  };
  actual_time_spent: {
    hours: number;
    minutes: number;
  };
  assigned_to: string[];
  assigned_by: string;
  mentor_id?: string;
  mentor_assigned_at?: Date;
  mentor_completion_date?: Date;
  mentor_rating?: number;
  mentor_review?: string;
  tags: string[];
  attachments: Array<{
    filename: string;
    url: string;
    file_type: string;
    uploaded_at: Date;
  }>;
  comments: Array<{
    user_id: string;
    content: string;
    timestamp: Date;
    edited: boolean;
  }>;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  is_active: boolean;
  type: 'task' | 'mentor' | 'both';
  mentor_count: number;
  task_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface MentorReview {
  _id: string;
  mentor_id: string;
  reviewer_id: string;
  task_id?: string;
  rating: number;
  review_text: string;
  review_type: 'task_review' | 'general_review';
  is_verified: boolean;
  helpful_votes: number;
  created_at: Date;
  updated_at: Date;
}

export interface MentorFollower {
  _id: string;
  mentor_id: string;
  follower_id: string;
  followed_at: Date;
  is_active: boolean;
}

