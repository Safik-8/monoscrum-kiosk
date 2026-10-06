import { useState, useEffect } from 'react';
import { API_URL } from '../constants/config';
import { fetchWithTimeout, parseResponse } from '../lib/http';
import { Session } from '../types';

export interface User {
  _id: string;
  name?: string;
  fullName?: string;
  username?: string;
  profileImage?: string;
}

export function useHistory(session: Session | null) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const [historyResult, setHistoryResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [branchHistory, setBranchHistory] = useState<any[]>([]);

  // 1. Fetch Users List
  const fetchUsers = async () => {
    if (!session?.accessToken) return;
    setBusy(true);
    try {
      // Assuming utils/api.ts for fetchWithTimeout
      const response = await fetchWithTimeout(`${API_URL}/kiosk/users`, {
        headers: { Authorization: `Bearer ${session.accessToken}` }
      });
      const data = await parseResponse(response);
      setUsers((data as any).data || []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchUsers();
    }
  }, [session]);

  const fetchBranchHistory = async () => {
    if (!session?.accessToken) return;
    setBusy(true);
    try {
      const response = await fetchWithTimeout(`${API_URL}/kiosk/branch-history`, {
        headers: { Authorization: `Bearer ${session.accessToken}` }
      });
      const data = await parseResponse(response);
      setBranchHistory((data as any).data || []);
      setError('');
    } catch (err: any) {
      console.log('Branch History Error:', err);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken && !selectedUser) {
      fetchBranchHistory();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchBranchHistory, 30000);
      return () => clearInterval(interval);
    }
  }, [session, selectedUser]);

  // 2. Fetch History when user or date changes
  const fetchHistory = async () => {
    if (!session?.accessToken || !selectedUser) return;
    setBusy(true);
    try {
      const formattedDate = targetDate.toISOString().split('T')[0];
      const response = await fetchWithTimeout(`${API_URL}/kiosk/history/${selectedUser._id}?date=${formattedDate}`, {
        headers: { Authorization: `Bearer ${session.accessToken}` }
      });
      const result = await parseResponse(response);
      setHistoryResult(result);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch history');
      setHistoryResult(null);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedUser, targetDate]);

  const changeDate = (days: number) => {
    const newDate = new Date(targetDate);
    newDate.setDate(newDate.getDate() + days);
    setTargetDate(newDate);
  };

  const setDate = (date: Date) => {
    setTargetDate(date);
  };

  return {
    users: users.filter(u => 
      (u.name || u.fullName || u.username || '').toLowerCase().includes(searchQuery.toLowerCase())
    ),
    searchQuery,
    setSearchQuery,
    selectedUser,
    setSelectedUser,
    targetDate,
    changeDate,
    setDate,
    historyResult,
    branchHistory,
    busy,
    error,
    refresh: fetchHistory,
    refreshBranchHistory: fetchBranchHistory
  };
}
