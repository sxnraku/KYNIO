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
      // Write binary bytes directly to file
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

export async function persistRemoteProfileImage(
  remoteUrl: string,
): Promise<string | null> {
  // Na web não há filesystem persistente; manter o avatar local atual é
  // preferível a guardar um URL assinado que expira.
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const response = await fetch(remoteUrl);

    if (!response.ok) {
      return null;
    }

    const bytes = new Uint8Array(await response.arrayBuffer());
    const mimeType = response.headers.get('content-type') ?? 'image/jpeg';
    const profileImagesDirectory = new Directory(Paths.document, PROFILE_IMAGES_DIRECTORY_NAME);
    profileImagesDirectory.create({ idempotent: true, intermediates: true });

    const filename = `avatar-remote-${Date.now()}.${getImageExtension(mimeType)}`;
    const destination = new File(profileImagesDirectory, filename);
    destination.write(bytes);

    return destination.uri;
  } catch {
    return null;
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
