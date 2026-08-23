jest.mock('expo-sqlite');
jest.mock('zustand');
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
