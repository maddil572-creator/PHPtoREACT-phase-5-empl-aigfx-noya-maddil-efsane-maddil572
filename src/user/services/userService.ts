import type { UserProfile } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const userService = {
  async getProfile(token: string): Promise<UserProfile> {
    const response = await fetch(`${API_BASE}/api/user/profile.php`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  },

  async updateProfile(token: string, data: { name?: string; avatar?: string }): Promise<void> {
    const response = await fetch(`${API_BASE}/api/user/profile.php`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }
  },

  async changePassword(token: string, data: { currentPassword: string; newPassword: string }): Promise<void> {
    const response = await fetch(`${API_BASE}/api/user/profile.php/password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to change password');
    }
  },

  async checkInDaily(token: string): Promise<{ reward: number; newStreak: number }> {
    const response = await fetch(`${API_BASE}/api/user/streak.php`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to check in');
    }

    return response.json();
  },
};
