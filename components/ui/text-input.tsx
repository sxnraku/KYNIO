import { forwardRef } from "react";
import {
  TextInput as NativeTextInput,
  type TextInputProps,
} from "react-native";

import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

export const TextInput = forwardRef<NativeTextInput, TextInputProps>(
  function TextInput({ accessibilityLabel, placeholder, ...props }, ref) {
    const language = useAppPreferencesStore((state) => state.language);

    return (
      <NativeTextInput
        accessibilityLabel={
          accessibilityLabel
            ? translateText(accessibilityLabel, language)
            : undefined
        }
        placeholder={
          placeholder ? translateText(placeholder, language) : undefined
        }
        ref={ref}
        {...props}
      />
    );
  },
);
