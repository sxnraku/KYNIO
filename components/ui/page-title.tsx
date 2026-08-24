import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

interface PageTitleProps {
  action?: ReactNode;
  description: string;
  title: string;
}

export function PageTitle({ action, description, title }: PageTitleProps) {
  return (
    <View>
      <View className="flex-row items-center justify-between gap-4">
        <Text className="min-w-0 flex-1 font-headline text-[28px] leading-9 text-foreground">
          {title}
        </Text>
        {action}
      </View>
      <Text className="mt-2 font-body text-base leading-6 text-muted">
        {description}
      </Text>
    </View>
  );
}
