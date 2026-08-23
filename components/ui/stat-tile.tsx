import { View } from "react-native";
import { Text } from "@/components/ui/text";

interface StatTileProps {
  label: string;
  value: string;
}

export function StatTile({ label, value }: StatTileProps) {
  return (
    <View className="min-w-0 flex-1 rounded-xl bg-background px-3 py-4">
      <Text className="font-headline text-2xl text-foreground">{value}</Text>
      <Text className="mt-1 font-label text-[9px] uppercase text-muted">
        {label}
      </Text>
    </View>
  );
}
