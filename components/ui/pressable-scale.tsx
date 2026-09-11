import { cssInterop } from "nativewind";
import React from "react";
import {
  Platform,
  Pressable,
  type GestureResponderEvent,
  type Insets,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export interface PressableScaleProps extends Omit<PressableProps, "style"> {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  targetScale?: number;
  pressInDuration?: number;
  pressOutDuration?: number;
  hitSlop?: Insets | number;
  pressRetentionOffset?: Insets | number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
cssInterop(AnimatedPressable, { className: "style" });

/**
 * Componente base de toque com física tátil (expo-animation Recipe #88):
 * - Escala física (0.97) em 100ms e retorno suave em 140ms
 * - Tolerância de toque (hitSlop) e amortecimento de arrasto (pressRetentionOffset)
 * - Suporte automático a redução de movimento (useReducedMotion)
 * - 100% no UI runtime do Reanimated no mobile e Pressable nativo na web
 */
export function PressableScale({
  children,
  className,
  style,
  targetScale = 0.97,
  pressInDuration = 100,
  pressOutDuration = 140,
  hitSlop = 8,
  pressRetentionOffset = 16,
  disabled,
  onPress,
  onPressIn,
  onPressOut,
  ...props
}: PressableScaleProps) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const handlePressIn = (event: GestureResponderEvent) => {
    if (!disabled && !reducedMotion) {
      scale.set(withTiming(targetScale, { duration: pressInDuration, easing: EASE_OUT }));
    }
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    if (!disabled && !reducedMotion) {
      scale.set(withTiming(1, { duration: pressOutDuration, easing: EASE_OUT }));
    }
    onPressOut?.(event);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  if (Platform.OS === "web") {
    return (
      <Pressable
        className={className}
        disabled={disabled}
        hitSlop={hitSlop}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={({ pressed }) => [
          style,
          pressed && !disabled && { transform: [{ scale: targetScale }] },
        ]}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <AnimatedPressable
      className={className}
      disabled={disabled}
      hitSlop={hitSlop}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      pressRetentionOffset={pressRetentionOffset}
      style={[style, animatedStyle]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}

cssInterop(PressableScale, { className: "style" });
