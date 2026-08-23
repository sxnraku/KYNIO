import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

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

export async function persistMealImage(sourceUri: string, mimeType: string): Promise<string> {
  if (Platform.OS === 'web') {
    return sourceUri;
  }

  const mealImagesDirectory = new Directory(Paths.document, MEAL_IMAGES_DIRECTORY_NAME);
  mealImagesDirectory.create({ idempotent: true, intermediates: true });

  const uniqueSuffix = Math.random().toString(36).slice(2, 10);
  const destination = new File(
    mealImagesDirectory,
    `meal-${Date.now()}-${uniqueSuffix}.${getImageExtension(mimeType)}`,
  );
  const source = new File(sourceUri);

  await source.copy(destination);
  return destination.uri;
}

export function deletePrivateLocalFiles(): void {
  const privateDirectories = [
    new Directory(Paths.document, MEAL_IMAGES_DIRECTORY_NAME),
    new Directory(Paths.cache, DATA_EXPORTS_DIRECTORY_NAME),
  ];

  for (const directory of privateDirectories) {
    if (directory.exists) {
      directory.delete();
    }
  }
}
