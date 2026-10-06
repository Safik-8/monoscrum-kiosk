import { useState, useEffect } from 'react';
import { API_URL } from '../constants/config';
import { fetchWithTimeout, parseResponse } from '../lib/http';
import { Session } from '../types';

export interface User {
  _id: string;
  name: string;
  username: string;
  profilePicture?: string;
  isFaceEnrolled?: boolean;
}

export function useEnroll(session: Session | null) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (session?.accessToken) {
      fetchUsers();
    }
  }, [session]);

  const fetchUsers = async () => {
    try {
      setBusy(true);
      setError('');
      const response = await fetchWithTimeout(`${API_URL}/kiosk/users`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` }
      });
      const result = await parseResponse(response);
      setUsers((result as any).data || []);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const captureAndEnroll = async (cameraRef: React.RefObject<any>) => {
    if (!cameraRef.current || !selectedUser || busy) return;
    
    try {
      setBusy(true);
      setError('');
      setSuccess(false);
      
      // Vision Camera v5 uses takePhoto()
      const photo = await cameraRef.current.takePhoto({ qualityPrioritization: 'speed' });
      if (!photo?.path) throw new Error('Unable to capture camera image.');
      
      // Convert file to base64
      const photoUri = `file://${photo.path}`;
      const fileResponse = await fetch(photoUri);
      const blob = await fileResponse.blob();
      const base64Str = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      const b64 = `data:image/jpeg;base64,${base64Str}`;
      setCapturedImage(b64);

      const response = await fetchWithTimeout(`${API_URL}/kiosk/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ userId: selectedUser._id, imageBase64: base64Str }),
      });
      
      const result = await parseResponse(response);
      if ((result as any).success) {
        setSuccess(true);
        setTimeout(() => {
          // Reset after success
          setSuccess(false);
          setSelectedUser(null);
          setCapturedImage(null);
        }, 3000);
      } else {
        throw new Error(result.message || 'Enrollment failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enrollment failed.');
      setCapturedImage(null);
    } finally {
      setBusy(false);
    }
  };

  const cancelEnrollment = () => {
    setSelectedUser(null);
    setCapturedImage(null);
    setError('');
  };

  return {
    users: filteredUsers,
    searchQuery,
    setSearchQuery,
    selectedUser,
    setSelectedUser,
    busy,
    error,
    success,
    capturedImage,
    captureAndEnroll,
    cancelEnrollment,
    refreshUsers: fetchUsers
  };
}
