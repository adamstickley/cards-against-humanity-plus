'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { IUser } from '../clients/users/UsersApi';
import { useApiContext } from './ApiContext';

export const useUserSync = (): IUser | null => {
  const { isSignedIn, user } = useUser();
  const api = useApiContext();
  const syncedUserRef = useRef<IUser | null>(null);
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!isSignedIn || !user || hasSyncedRef.current) {
      return;
    }

    const syncUser = async () => {
      try {
        const syncedUser = await api.Users.syncUser({
          clerkUserId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          displayName:
            user.fullName || user.firstName || user.username || undefined,
          avatarUrl: user.imageUrl || undefined,
        });
        syncedUserRef.current = syncedUser;
        hasSyncedRef.current = true;
      } catch (error) {
        console.error('Failed to sync user:', error);
      }
    };

    syncUser();
  }, [isSignedIn, user, api]);

  return syncedUserRef.current;
};
