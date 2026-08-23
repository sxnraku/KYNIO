jest.mock('expo-sqlite');
jest.mock('zustand');
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
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
