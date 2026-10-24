import { Alert, Platform } from 'react-native';

/**
 * (No react-native-web o Alert.alert não funciona, então uso o window.alert/confirm.)
 */
export function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

export function confirmAction(opts: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  const { title, message, confirmLabel, onConfirm } = opts;

  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}