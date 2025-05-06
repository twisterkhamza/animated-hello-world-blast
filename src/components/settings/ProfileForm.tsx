
import React, { useState } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/sonner';

export const ProfileForm: React.FC = () => {
  const { user, updateUserProfile } = useJournal();
  
  const [profile, setProfile] = useState<Partial<User>>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    avatarUrl: user?.avatarUrl || ''
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      updateUserProfile(profile);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('There was an error updating your profile');
      console.error('Error updating profile:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex justify-center mb-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatarUrl || undefined} alt="Profile" />
              <AvatarFallback className="text-3xl">
                {profile.firstName ? profile.firstName[0] : 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={profile.firstName}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={profile.lastName}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              name="avatarUrl"
              value={profile.avatarUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          
          <div className="flex justify-end mt-6">
            <Button type="submit">
              Update Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
