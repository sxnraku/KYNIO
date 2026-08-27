import { fireEvent, render, screen } from '@testing-library/react-native';

import { FastingStartModal } from '@/components/ui/fasting-start-modal';

const NOW = new Date(2026, 7, 24, 14, 30, 0, 0).getTime();

describe('FastingStartModal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('permite iniciar um jejum a partir de uma data e hora anteriores', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn(() => true);

    await render(
      <FastingStartModal
        initialStartedAt={null}
        mode="start"
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    await fireEvent.changeText(
      screen.getByTestId('fasting-start-date-input'),
      '24082026',
    );
    await fireEvent.changeText(
      screen.getByTestId('fasting-start-time-input'),
      '0815',
    );
    await fireEvent.press(screen.getByTestId('confirm-fasting-start-button'));

    expect(onConfirm).toHaveBeenCalledWith(
      new Date(2026, 7, 24, 8, 15, 0, 0).getTime(),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('mostra uma validação e não guarda uma hora futura', async () => {
    const onConfirm = jest.fn(() => true);

    await render(
      <FastingStartModal
        initialStartedAt={null}
        mode="start"
        onClose={jest.fn()}
        onConfirm={onConfirm}
      />,
    );

    await fireEvent.changeText(
      screen.getByTestId('fasting-start-date-input'),
      '24082026',
    );
    await fireEvent.changeText(
      screen.getByTestId('fasting-start-time-input'),
      '1530',
    );
    await fireEvent.press(screen.getByTestId('confirm-fasting-start-button'));

    expect(
      screen.getByText('A hora de início não pode estar no futuro.'),
    ).toBeTruthy();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
