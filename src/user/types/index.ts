export type Role = 'user' | 'editor' | 'viewer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  joinDate: string;
  membershipTier: string;
  verified: boolean;
  role: Role;
}

export interface TokenInfo {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  history: TokenTransaction[];
}

export interface TokenTransaction {
  id: string;
  type: 'earn' | 'spend' | 'bonus' | 'refund';
  amount: number;
  description: string;
  date: string;
}

export interface StreakInfo {
  current: number;
  longest: number;
  lastCheckIn: string | null;
  nextMilestone: number;
  rewards: Record<number, number>;
}

export interface ReferralInfo {
  code: string;
  totalReferred: number;
  successfulConversions: number;
  earningsFromReferrals: number;
  referralLink: string;
}

export interface Order {
  id: string;
  service: string;
  package: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  orderDate: string;
  expectedCompletion: string | null;
  completionDate: string | null;
  amount: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date: string | null;
  progress: number;
  target: number;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  newsletter: boolean;
  theme: 'light' | 'dark';
}

export interface UserProfile {
  user: User;
  tokens: TokenInfo;
  streak: StreakInfo;
  referrals: ReferralInfo;
  orders: Order[];
  achievements: Achievement[];
  preferences: UserPreferences;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: Role;
  verified: boolean;
  lastLogin: string | null;
  joinDate: string;
  tokenBalance: number;
  totalEarned: number;
  totalOrders: number;
}

export interface UserListResponse {
  users: AdminUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
