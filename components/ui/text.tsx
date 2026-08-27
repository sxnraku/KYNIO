import { forwardRef, type ReactNode } from "react";
import {
  Text as NativeText,
  type TextProps as NativeTextProps,
} from "react-native";

import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

interface TextProps extends NativeTextProps {
  children?: ReactNode;
  translate?: boolean;
}

function translateNode(node: ReactNode, language: "en" | "pt"): ReactNode {
  if (typeof node === "string") {
    return translateText(node, language);
  }

  if (Array.isArray(node)) {
    return node.map((child) => translateNode(child, language));
  }

  return node;
}

export const Text = forwardRef<NativeText, TextProps>(function Text(
  { children, translate = true, ...props },
  ref,
) {
  const language = useAppPreferencesStore((state) => state.language);

  return (
    <NativeText ref={ref} {...props}>
      {translate ? translateNode(children, language) : children}
    </NativeText>
  );
});

export const AppText = Text;

