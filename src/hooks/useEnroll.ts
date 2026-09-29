import { useState, useEffect } from 'react';
import { CameraView } from 'expo-camera';
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
      setUsers(result.data || []);
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

  const captureAndEnroll = async (cameraRef: React.RefObject<CameraView | null>) => {
    if (!cameraRef.current || !selectedUser || busy) return;
    
    try {
      setBusy(true);
      setError('');
      setSuccess(false);
      
      const image = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.65 });
      if (!image?.base64) throw new Error('Unable to capture camera image.');
      
      const b64 = `data:image/jpeg;base64,${image.base64}`;
      setCapturedImage(b64);

      const response = await fetchWithTimeout(`${API_URL}/kiosk/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ userId: selectedUser._id, imageBase64: image.base64 }),
      });
      
      const result = await parseResponse(response);
      if (result.success) {
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
