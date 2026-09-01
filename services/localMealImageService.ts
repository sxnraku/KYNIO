import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { PROFILE_IMAGES_DIRECTORY_NAME } from '@/services/localProfileImageService';

const MEAL_IMAGES_DIRECTORY_NAME = 'meal-images';
export const DATA_EXPORTS_DIRECTORY_NAME = 'data-exports';

function getImageExtension(mimeType: string): string {
  const extensionsByMimeType: Record<string, string> = {
    'image/avif': 'avif',
    'image/bmp': 'bmp',
    'image/gif': 'gif',
    'image/heic': 'heic',
    'image/heif': 'heif',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/tiff': 'tiff',
    'image/webp': 'webp',
  };

  return extensionsByMimeType[mimeType.toLowerCase()] ?? 'jpg';
}

function base64ToUint8Array(base64: string): Uint8Array {
  const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
  const binaryString = atob(cleanBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function persistMealImage(
  sourceUri: string,
  mimeType: string,
  base64?: string | null,
): Promise<string> {
  if (Platform.OS === 'web') {
    return sourceUri;
  }

  try {
    const mealImagesDirectory = new Directory(Paths.document, MEAL_IMAGES_DIRECTORY_NAME);
    mealImagesDirectory.create({ idempotent: true, intermediates: true });

    const uniqueSuffix = Math.random().toString(36).slice(2, 10);
    const destination = new File(
      mealImagesDirectory,
      `meal-${Date.now()}-${uniqueSuffix}.${getImageExtension(mimeType)}`,
    );

    if (base64) {
      destination.write(base64ToUint8Array(base64));
    } else {
      const source = new File(sourceUri);
      await source.copy(destination);
    }

    return destination.uri;
  } catch {
    return sourceUri;
  }
}

export function deletePrivateLocalFiles(): void {
  try {
    const privateDirectories = [
      new Directory(Paths.document, MEAL_IMAGES_DIRECTORY_NAME),
      new Directory(Paths.document, PROFILE_IMAGES_DIRECTORY_NAME),
      new Directory(Paths.cache, DATA_EXPORTS_DIRECTORY_NAME),
    ];

    for (const directory of privateDirectories) {
      if (directory.exists) {
        directory.delete();
      }
    }
  } catch {
    // Silently ignore cleanup errors
  }
}
