// Save / share decorated design images (in-app store is separate in lib/store.ts).
import * as FileSystem from 'expo-file-system/legacy';
import { Platform, Share } from 'react-native';

function cacheDir(): string {
  return FileSystem.cacheDirectory || FileSystem.documentDirectory || '';
}

/** Write base64 PNG to a local file and return its URI. */
export async function writeDesignFile(
  imageBase64: string,
  filename = `decorai-${Date.now()}.png`,
): Promise<string> {
  const dir = cacheDir();
  if (!dir) throw new Error('File system is not available on this platform.');
  const uri = `${dir}${filename}`;
  await FileSystem.writeAsStringAsync(uri, imageBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return uri;
}

/** System share sheet with the design image when possible. */
export async function shareDesign(opts: {
  imageBase64: string;
  eventType: string;
  style: string;
  items?: string[];
}): Promise<void> {
  const uri = await writeDesignFile(opts.imageBase64);
  const message = `My DecorAI GH ${opts.eventType} design — ${opts.style} style${
    opts.items?.length ? `. Items: ${opts.items.join(', ')}` : ''
  }`;

  try {
    // Prefer expo-sharing when available (better Android file share)
    try {
      const Sharing = await import('expo-sharing');
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share DecorAI GH design',
          UTI: 'public.png',
        });
        return;
      }
    } catch {
      /* fall through */
    }

    await Share.share(
      Platform.OS === 'ios'
        ? { url: uri, message }
        : { message: `${message}\n${uri}`, title: 'DecorAI GH design' },
    );
  } catch {
    await Share.share({ message });
  }
}

/**
 * Save to camera roll / gallery (DecorAI GH album when possible).
 * Falls back to share sheet "Save Image" if media library is unavailable.
 */
export async function saveDesignToCameraRoll(imageBase64: string): Promise<string> {
  const uri = await writeDesignFile(imageBase64);

  try {
    const MediaLibrary = await import('expo-media-library');
    const perm = await MediaLibrary.requestPermissionsAsync();
    if (!perm.granted) {
      throw new Error('Photo library permission is required to save the design.');
    }
    const asset = await MediaLibrary.createAssetAsync(uri);
    try {
      const album = await MediaLibrary.getAlbumAsync('DecorAI GH');
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      } else {
        await MediaLibrary.createAlbumAsync('DecorAI GH', asset, false);
      }
    } catch {
      /* album optional */
    }
    return 'Saved to camera roll (DecorAI GH album)';
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('permission')) throw e;
    try {
      const Sharing = await import('expo-sharing');
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Save DecorAI GH design',
        });
        return 'Opened share sheet — choose Save Image / Photos';
      }
    } catch {
      /* fall through */
    }
    await Share.share(
      Platform.OS === 'ios'
        ? { url: uri, message: 'Save this DecorAI GH design to your photos' }
        : { message: `Save this DecorAI GH design:\n${uri}` },
    );
    return 'Opened share sheet — choose Save Image / Photos';
  }
}
