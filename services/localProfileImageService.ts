import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

export const PROFILE_IMAGES_DIRECTORY_NAME = 'profile-images';

function getImageExtension(mimeType: string): string {
  const extensionsByMimeType: Record<string, string> = {
    'image/heic': 'heic',
    'image/heif': 'heif',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };

  return extensionsByMimeType[mimeType.toLowerCase()] ?? 'jpg';
}

export async function persistProfileImage(
  sourceUri: string,
  mimeType: string,
  base64: string | null,
): Promise<string> {
  if (Platform.OS === 'web') {
    if (!base64) {
      throw new Error('Não foi possível guardar esta fotografia localmente.');
    }

    return `data:${mimeType};base64,${base64}`;
  }

  try {
    const profileImagesDirectory = new Directory(Paths.document, PROFILE_IMAGES_DIRECTORY_NAME);
    profileImagesDirectory.create({ idempotent: true, intermediates: true });

    const filename = `avatar-${Date.now()}.${getImageExtension(mimeType)}`;
    const destination = new File(profileImagesDirectory, filename);

    if (base64) {
      // Write base64 directly to file - avoids URI scheme issues with content://
      destination.write(base64);
    } else {
      const source = new File(sourceUri);
      await source.copy(destination);
    }

    return destination.uri;
  } catch {
    return sourceUri;
  }
}

export function deleteProfileImage(uri: string | null): void {
  if (!uri || Platform.OS === 'web' || uri.startsWith('data:') || uri.startsWith('http')) {
    return;
  }

  try {
    const image = new File(uri);
    if (image.exists) {
      image.delete();
    }
  } catch {
    // Silently ignore deletion errors
  }
}
