jest.setTimeout(45000);

jest.mock('expo-sqlite');
jest.mock('zustand');
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({
      type: 'success',
      data: { idToken: 'mock-google-id-token' },
    }),
    signOut: jest.fn().mockResolvedValue(undefined),
  },
  isErrorWithCode: (error: unknown) =>
    typeof error === 'object' && error !== null && 'code' in error,
  isSuccessResponse: (response: unknown) =>
    typeof response === 'object' &&
    response !== null &&
    'type' in response &&
    response.type === 'success',
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));
jest.mock('react-native-iap', () => ({
  endConnection: jest.fn().mockResolvedValue(true),
  finishTransaction: jest.fn().mockResolvedValue(true),
  flushFailedPurchasesCachedAsPendingAndroid: jest.fn().mockResolvedValue(true),
  getAvailablePurchases: jest.fn().mockResolvedValue([]),
  getProducts: jest.fn().mockResolvedValue([]),
  getSubscriptions: jest.fn().mockResolvedValue([]),
  initConnection: jest.fn().mockResolvedValue(true),
  requestPurchase: jest.fn(),
  requestSubscription: jest.fn(),
}));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));
jest.mock('expo-notifications', () => ({
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-notification-id'),
  setNotificationHandler: jest.fn(),
  SchedulableTriggerInputTypes: {
    DAILY: 'daily',
    TIME_INTERVAL: 'timeInterval',
  },
}));
jest.mock('expo-camera', () => {
  const { View } = require('react-native') as typeof import('react-native');

  return {
    CameraView: View,
    useCameraPermissions: () => [
      { canAskAgain: true, granted: true, status: 'granted' },
      jest.fn(),
    ],
  };
});
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native') as typeof import('react-native');

  return {
    SafeAreaProvider: View,
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
  };
});



