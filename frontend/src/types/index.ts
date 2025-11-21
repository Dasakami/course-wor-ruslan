export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string; 
}

export interface Teacher extends User {
  specialization?: string;
  bio?: string;
  rating?: number;
}

export interface AvailabilitySlot {
  id: number;
  teacher_id: number;
  start_time: string; 
  end_time: string;
  is_booked: boolean;
  created_at: string; 
}


export interface Booking {
  id: number;
  teacher_id: number;
  student_id: number;
  availability_id: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  start_time: string;
  end_time: string;
  teacher_name: string;
  student_name: string;
  created_at: string;
  notes?: string;
}


export interface BookingWithDetails extends Booking {
  start_time: string; 
  end_time: string;
  teacher_name: string;
  student_name: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  token_type?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: 'student' | 'teacher';
}
