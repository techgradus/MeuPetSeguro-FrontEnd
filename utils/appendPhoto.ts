import { Platform } from 'react-native';

/**
 * Anexa uma foto (URI escolhida no ImagePicker) ao FormData no campo "photo".
 * No navegador precisa virar Blob; no celular basta {uri, name, type}.
 */
export async function appendPhoto(form: FormData, uri: string) {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
    form.append('photo', blob, `photo.${ext}`);
    return;
  }
  const ext = uri.split('?')[0].split('.').pop()?.toLowerCase();
  const isPng = ext === 'png';
  const isWebp = ext === 'webp';
  const type = isPng ? 'image/png' : isWebp ? 'image/webp' : 'image/jpeg';
  const name = `photo.${isPng ? 'png' : isWebp ? 'webp' : 'jpg'}`;
  form.append('photo', { uri, name, type } as unknown as Blob);
}