// This file is no longer needed - remove it completely
  id: string;
  name: string;
  followers: number;
  following: number;
  avatar?: string;
}

export const userApi = {
  async getProfile(): Promise<UserProfile> {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
};
