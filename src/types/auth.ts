export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'user' | 'institution' | 'employer' | 'admin';
  institution?: string;
  created_at?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
