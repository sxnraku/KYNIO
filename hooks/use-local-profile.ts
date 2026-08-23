import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import type { FriendRecord, UserProfileRecord } from '@/db/schema';
import {
  deleteFriendRecord,
  getFriendRecords,
  getUserProfile,
  saveFriendRecord,
  updateLocalProfile,
} from '@/services/dbService';
import { deleteRemoteFriendContact } from '@/services/cloudSyncService';
import {
  deleteProfileImage,
  persistProfileImage,
} from '@/services/localProfileImageService';

interface SaveProfileDetailsInput {
  bio: string;
  displayName: string;
}

interface LocalProfileState {
  error: string | null;
  friends: FriendRecord[];
  isLoading: boolean;
  isSaving: boolean;
  profile: UserProfileRecord | null;
  success: string | null;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

const INITIAL_STATE: LocalProfileState = {
  error: null,
  friends: [],
  isLoading: true,
  isSaving: false,
  profile: null,
  success: null,
};

export function useLocalProfile() {
  const [state, setState] = useState<LocalProfileState>(INITIAL_STATE);

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, error: null, isLoading: true }));

    try {
      const [profile, friends] = await Promise.all([getUserProfile(), getFriendRecords()]);
      setState((current) => ({ ...current, friends, isLoading: false, profile }));
    } catch (error) {
      setState((current) => ({
        ...current,
        error: getErrorMessage(error, 'Não foi possível atualizar o perfil local.'),
        isLoading: false,
      }));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      setState((current) => ({ ...current, error: null, isLoading: true }));

      void Promise.all([getUserProfile(), getFriendRecords()])
        .then(([profile, friends]) => {
          if (isMounted) {
            setState({
              error: null,
              friends,
              isLoading: false,
              isSaving: false,
              profile,
              success: null,
            });
          }
        })
        .catch((error: unknown) => {
          if (isMounted) {
            setState((current) => ({
              ...current,
              error: getErrorMessage(error, 'Não foi possível carregar o perfil local.'),
              isLoading: false,
            }));
          }
        });

      return () => {
        isMounted = false;
      };
    }, []),
  );

  const saveDetails = useCallback(
    async ({ bio, displayName }: SaveProfileDetailsInput) => {
      if (!state.profile || state.isSaving) {
        return;
      }

      setState((current) => ({ ...current, error: null, isSaving: true, success: null }));

      try {
        const profile = await updateLocalProfile({
          avatarUri: state.profile.avatarUri,
          bio,
          displayName,
        });
        setState((current) => ({
          ...current,
          isSaving: false,
          profile,
          success: 'Perfil guardado apenas neste dispositivo.',
        }));
      } catch (error) {
        setState((current) => ({
          ...current,
          error: getErrorMessage(error, 'Não foi possível guardar o perfil.'),
          isSaving: false,
        }));
      }
    },
    [state.isSaving, state.profile],
  );

  const pickAvatar = useCallback(async () => {
    if (!state.profile || state.isSaving) {
      return;
    }

    try {
      setState((current) => ({ ...current, error: null, success: null }));
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setState((current) => ({
          ...current,
          error: 'Autoriza o acesso às fotografias para escolher uma imagem de perfil.',
        }));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        base64: true,
        mediaTypes: ['images'],
        quality: 0.75,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      if (!asset) {
        throw new Error('Não foi possível ler a fotografia escolhida.');
      }

      setState((current) => ({ ...current, isSaving: true }));
      const previousUri = state.profile.avatarUri;
      const avatarUri = await persistProfileImage(
        asset.uri,
        asset.mimeType ?? 'image/jpeg',
        asset.base64 ?? null,
      );
      let profile: UserProfileRecord;

      try {
        profile = await updateLocalProfile({
          avatarRemotePath: null,
          avatarUri,
          bio: state.profile.bio,
          displayName: state.profile.displayName,
        });
      } catch (error) {
        deleteProfileImage(avatarUri);
        throw error;
      }

      deleteProfileImage(previousUri);

      setState((current) => ({
        ...current,
        isSaving: false,
        profile,
        success: 'Fotografia de perfil guardada localmente.',
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        error: getErrorMessage(error, 'Não foi possível guardar a fotografia de perfil.'),
        isSaving: false,
      }));
    }
  }, [state.isSaving, state.profile]);

  const removeAvatar = useCallback(async () => {
    if (!state.profile?.avatarUri || state.isSaving) {
      return;
    }

    const previousUri = state.profile.avatarUri;
    setState((current) => ({ ...current, error: null, isSaving: true, success: null }));

    try {
      const profile = await updateLocalProfile({
        avatarRemotePath: null,
        avatarUri: null,
        bio: state.profile.bio,
        displayName: state.profile.displayName,
      });
      deleteProfileImage(previousUri);
      setState((current) => ({
        ...current,
        isSaving: false,
        profile,
        success: 'Fotografia removida.',
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        error: getErrorMessage(error, 'Não foi possível remover a fotografia.'),
        isSaving: false,
      }));
    }
  }, [state.isSaving, state.profile]);

  const addFriend = useCallback(
    async (displayName: string) => {
      if (state.isSaving) {
        return false;
      }

      setState((current) => ({ ...current, error: null, isSaving: true, success: null }));

      try {
        const friend = await saveFriendRecord(displayName);
        setState((current) => ({
          ...current,
          friends: [friend, ...current.friends],
          isSaving: false,
          success: `${friend.displayName} foi adicionado à tua lista local.`,
        }));
        return true;
      } catch (error) {
        setState((current) => ({
          ...current,
          error: getErrorMessage(error, 'Não foi possível adicionar este amigo.'),
          isSaving: false,
        }));
        return false;
      }
    },
    [state.isSaving],
  );

  const removeFriend = useCallback(
    async (id: number) => {
      if (state.isSaving) {
        return;
      }

      setState((current) => ({ ...current, error: null, isSaving: true, success: null }));

      try {
        const friend = state.friends.find((entry) => entry.id === id);

        if (friend?.id && state.profile?.cloudUserId) {
          await deleteRemoteFriendContact(friend.createdAt, friend.displayName);
        }

        await deleteFriendRecord(id);
        setState((current) => ({
          ...current,
          friends: current.friends.filter((friend) => friend.id !== id),
          isSaving: false,
          success: 'Amigo removido da lista local.',
        }));
      } catch (error) {
        setState((current) => ({
          ...current,
          error: getErrorMessage(error, 'Não foi possível remover este amigo.'),
          isSaving: false,
        }));
      }
    },
    [state.friends, state.isSaving, state.profile?.cloudUserId],
  );

  return {
    ...state,
    addFriend,
    pickAvatar,
    removeAvatar,
    removeFriend,
    reload,
    saveDetails,
  };
}
