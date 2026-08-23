import { Ionicons } from '@expo/vector-icons';
import {
  CameraView,
  type CameraCapturedPicture,
  type CameraType,
  useCameraPermissions,
} from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SelectedMealImage } from '@/types/meal';

interface MealCameraModalProps {
  onClose: () => void;
  onUsePhoto: (image: SelectedMealImage) => void;
  visible: boolean;
}

function toSelectedMealImage(photo: CameraCapturedPicture): SelectedMealImage | null {
  if (!photo.base64) {
    return null;
  }

  const sourceMimeType = photo.format === 'png' ? 'image/png' : 'image/jpeg';
  const base64 = photo.base64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');

  return {
    base64,
    mimeType: sourceMimeType,
    sourceMimeType,
    uri: photo.uri,
  };
}

export function MealCameraModal({ onClose, onUsePhoto, visible }: MealCameraModalProps) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<CameraCapturedPicture | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setCapturedPhoto(null);
      setCameraError(null);
      setIsCameraReady(false);
      setIsCapturing(false);
    }
  }, [visible]);

  const capturePhoto = async () => {
    if (!cameraRef.current || !isCameraReady || isCapturing) {
      return;
    }

    setIsCapturing(true);
    setCameraError(null);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        imageType: 'jpg',
        quality: 0.72,
      });
      setCapturedPhoto(photo);
    } catch {
      setCameraError('Não foi possível captar a fotografia. Tenta novamente.');
    } finally {
      setIsCapturing(false);
    }
  };

  const confirmPhoto = () => {
    if (!capturedPhoto) {
      return;
    }

    const selectedImage = toSelectedMealImage(capturedPhoto);

    if (!selectedImage) {
      setCameraError('A câmara não devolveu os dados da imagem. Repete a fotografia.');
      return;
    }

    onUsePhoto(selectedImage);
    onClose();
  };

  const renderPermissionContent = () => {
    if (!permission) {
      return (
        <View className="flex-1 items-center justify-center bg-[#050706] px-8">
          <ActivityIndicator color="#10B981" size="large" />
          <Text className="mt-4 font-body text-sm text-white/70">A preparar a câmara…</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View className="flex-1 items-center justify-center bg-[#050706] px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-success/20">
            <Ionicons color="#10B981" name="camera-outline" size={30} />
          </View>
          <Text className="mt-6 text-center font-headline text-2xl text-white">Ativar câmara</Text>
          <Text className="mt-3 max-w-[320px] text-center font-body text-sm leading-6 text-white/65">
            O acesso é usado apenas para enquadrar e fotografar esta refeição. A captura só acontece quando tocares no botão.
          </Text>
          <Pressable
            accessibilityRole="button"
            className="mt-7 w-full max-w-[320px] items-center rounded-2xl bg-success py-4"
            onPress={() => {
              if (permission.canAskAgain) {
                void requestPermission();
              } else {
                void Linking.openSettings();
              }
            }}>
            <Text className="font-headline text-base text-white">
              {permission.canAskAgain ? 'Permitir acesso à câmara' : 'Abrir definições'}
            </Text>
          </Pressable>
        </View>
      );
    }

    if (capturedPhoto) {
      return (
        <View className="flex-1 bg-[#050706]">
          <Image className="flex-1" resizeMode="contain" source={{ uri: capturedPhoto.uri }} />
          <View className="flex-row gap-3 px-5 pb-6 pt-4">
            <Pressable
              accessibilityRole="button"
              className="flex-1 items-center rounded-2xl border border-white/20 bg-white/10 py-4"
              onPress={() => {
                setCapturedPhoto(null);
                setCameraError(null);
                setIsCameraReady(false);
              }}>
              <Text className="font-headline text-sm text-white">Repetir</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="flex-[1.4] flex-row items-center justify-center rounded-2xl bg-success py-4"
              onPress={confirmPhoto}>
              <Ionicons color="#FFFFFF" name="checkmark" size={20} />
              <Text className="ml-2 font-headline text-sm text-white">Usar fotografia</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <View className="flex-1 bg-black">
        <CameraView
          facing={facing}
          flash="off"
          onCameraReady={() => setIsCameraReady(true)}
          onMountError={() => setCameraError('Não foi possível iniciar a pré-visualização da câmara.')}
          ref={cameraRef}
          style={{ flex: 1 }}
        />

        <View pointerEvents="none" className="absolute inset-x-8 top-[18%] aspect-square rounded-[32px] border-2 border-white/80">
          <View className="absolute inset-x-5 bottom-5 rounded-full bg-black/45 px-4 py-2">
            <Text className="text-center font-body text-xs text-white">Enquadra a refeição</Text>
          </View>
        </View>

        {cameraError ? (
          <View className="absolute inset-x-5 bottom-32 rounded-2xl bg-[#7F1D1D]/95 p-4">
            <Text className="text-center font-body text-sm text-white">{cameraError}</Text>
          </View>
        ) : null}

        <View className="absolute inset-x-0 bottom-0 flex-row items-center justify-around bg-black/55 px-8 pb-7 pt-5">
          <Pressable
            accessibilityLabel="Trocar câmara"
            accessibilityRole="button"
            className="h-12 w-12 items-center justify-center rounded-full bg-white/15"
            onPress={() => setFacing((current) => (current === 'back' ? 'front' : 'back'))}>
            <Ionicons color="#FFFFFF" name="camera-reverse-outline" size={24} />
          </Pressable>

          <Pressable
            accessibilityLabel="Captar fotografia"
            accessibilityRole="button"
            accessibilityState={{ disabled: !isCameraReady || isCapturing }}
            className="h-[76px] w-[76px] items-center justify-center rounded-full border-4 border-white bg-white/25"
            disabled={!isCameraReady || isCapturing}
            onPress={() => void capturePhoto()}>
            {isCapturing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View className="h-[58px] w-[58px] rounded-full bg-white" />
            )}
          </Pressable>

          <View className="h-12 w-12" />
        </View>
      </View>
    );
  };

  return (
    <Modal animationType="fade" onRequestClose={onClose} presentationStyle="fullScreen" visible={visible}>
      <SafeAreaView className="flex-1 bg-[#050706]">
        <View className="h-16 flex-row items-center justify-between bg-[#050706] px-5">
          <Pressable
            accessibilityLabel="Fechar câmara"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
            onPress={onClose}>
            <Ionicons color="#FFFFFF" name="close" size={23} />
          </Pressable>
          <View className="items-center">
            <Text className="font-headline text-base text-white">Fotografar refeição</Text>
            <Text className="font-body text-[11px] text-white/55">Pré-visualização em direto</Text>
          </View>
          <View className="h-10 w-10" />
        </View>
        {renderPermissionContent()}
      </SafeAreaView>
    </Modal>
  );
}
