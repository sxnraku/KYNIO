import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { COLORS } from '@/constants/colors';
import type { FriendRecord } from '@/db/schema';

interface FriendsPanelProps {
  friends: FriendRecord[];
  isSaving: boolean;
  onAdd: (displayName: string) => Promise<boolean>;
  onRemove: (id: number) => Promise<void>;
}

function initialFor(name: string): string {
  return name.trim().charAt(0).toLocaleUpperCase('pt-PT') || '?';
}

export function FriendsPanel({ friends, isSaving, onAdd, onRemove }: FriendsPanelProps) {
  const [friendName, setFriendName] = useState('');

  const addFriend = async () => {
    const added = await onAdd(friendName);

    if (added) {
      setFriendName('');
    }
  };

  const confirmRemove = (friend: FriendRecord) => {
    Alert.alert(
      'Remover amigo?',
      `${friend.displayName} deixa de aparecer na tua lista e a alteração será sincronizada na próxima ligação.`,
      [
        { style: 'cancel', text: 'Cancelar' },
        {
          onPress: () => void onRemove(friend.id),
          style: 'destructive',
          text: 'Remover',
        },
      ],
    );
  };

  return (
    <View>
      <Card>
        <Text className="font-label text-[10px] uppercase tracking-widest text-success">
          O teu círculo
        </Text>
        <Text className="mt-2 font-headline text-xl text-foreground">Amigos</Text>
        <Text className="mt-2 font-body text-sm leading-5 text-muted">
          Guarda pessoas importantes e sincroniza a lista entre os teus dispositivos. Não são
          partilhados jejuns, refeições ou treinos automaticamente.
        </Text>

        <View className="mt-5 flex-row gap-2">
          <TextInput
            accessibilityLabel="Nome do amigo"
            className="min-h-12 min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground"
            maxLength={40}
            onChangeText={setFriendName}
            onSubmitEditing={() => void addFriend()}
            placeholder="Nome do amigo"
            placeholderTextColor={COLORS.muted}
            returnKeyType="done"
            value={friendName}
          />
          <Pressable
            accessibilityLabel="Adicionar amigo"
            accessibilityRole="button"
            accessibilityState={{ disabled: isSaving || !friendName.trim() }}
            className="h-12 w-12 items-center justify-center rounded-xl bg-success active:opacity-80 disabled:opacity-50"
            disabled={isSaving || !friendName.trim()}
            onPress={() => void addFriend()}>
            <Ionicons color={COLORS.background} name="person-add" size={20} />
          </Pressable>
        </View>
      </Card>

      <View className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface px-5">
        {friends.length ? (
          friends.map((friend, index) => (
            <View
              className={`flex-row items-center py-4 ${
                index < friends.length - 1 ? 'border-b border-border' : ''
              }`}
              key={friend.id}>
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-success/10">
                <Text className="font-headline text-base text-success">
                  {initialFor(friend.displayName)}
                </Text>
              </View>
              <View className="ml-3 min-w-0 flex-1">
                <Text className="font-headline text-base text-foreground" numberOfLines={1}>
                  {friend.displayName}
                </Text>
                <Text className="mt-0.5 font-body text-xs text-muted">Na tua lista privada</Text>
              </View>
              <Pressable
                accessibilityLabel={`Remover ${friend.displayName}`}
                accessibilityRole="button"
                className="h-10 w-10 items-center justify-center rounded-full active:bg-background"
                onPress={() => confirmRemove(friend)}>
                <Ionicons color={COLORS.muted} name="close" size={19} />
              </Pressable>
            </View>
          ))
        ) : (
          <View className="items-center py-10">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-background">
              <Ionicons color={COLORS.muted} name="people-outline" size={25} />
            </View>
            <Text className="mt-4 font-headline text-base text-foreground">Lista vazia</Text>
            <Text className="mt-1 text-center font-body text-sm text-muted">
              Adiciona o primeiro nome ao teu círculo.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
