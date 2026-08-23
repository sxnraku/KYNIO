import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

type CardProps = PropsWithChildren;

export function Card({ children }: CardProps) {
  return <View className="rounded-2xl border border-border bg-surface p-5">{children}</View>;
}
