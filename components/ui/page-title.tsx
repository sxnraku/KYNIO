import { View } from "react-native";
import { Text } from "@/components/ui/text";

interface PageTitleProps {
  description: string;
  title: string;
}

export function PageTitle({ description, title }: PageTitleProps) {
  return (
    <View>
      <Text className="font-headline text-[28px] leading-9 text-foreground">
        {title}
      </Text>
      <Text className="mt-2 font-body text-base leading-6 text-muted">
        {description}
      </Text>
    </View>
  );
}
