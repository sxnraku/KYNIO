import * as Haptics from 'expo-haptics';

import {
  triggerHeavyImpact,
  triggerLightImpact,
  triggerMediumImpact,
  triggerSuccessFeedback,
} from '@/services/hapticsService';

describe('hapticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('dispara vibrações hápticas leves, médias, pesadas e de sucesso', () => {
    triggerLightImpact();
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);

    triggerMediumImpact();
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);

    triggerHeavyImpact();
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);

    triggerSuccessFeedback();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success,
    );
  });
});
