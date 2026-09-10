import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { PressableScale } from '@/components/ui/pressable-scale';

describe('PressableScale', () => {
  it('renders children correctly', async () => {
    await render(
      <PressableScale onPress={jest.fn()}>
        <Text>Carregar</Text>
      </PressableScale>,
    );

    expect(screen.getByText('Carregar')).toBeTruthy();
  });

  it('triggers onPress callback when clicked', async () => {
    const handlePress = jest.fn();
    await render(
      <PressableScale onPress={handlePress}>
        <Text>Clique</Text>
      </PressableScale>,
    );

    fireEvent.press(screen.getByText('Clique'));
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('handles pressIn and pressOut events without throwing', async () => {
    const handlePressIn = jest.fn();
    const handlePressOut = jest.fn();
    await render(
      <PressableScale
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        targetScale={0.95}
      >
        <Text>Tocar</Text>
      </PressableScale>,
    );

    const button = screen.getByText('Tocar');
    fireEvent(button, 'pressIn');
    expect(handlePressIn).toHaveBeenCalledTimes(1);

    fireEvent(button, 'pressOut');
    expect(handlePressOut).toHaveBeenCalledTimes(1);
  });
});
