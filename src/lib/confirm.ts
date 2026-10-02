import { Alert, Platform } from 'react-native';

/** Platformdan bağımsız onay penceresi (web'de Alert çalışmıyor). */
export function confirm(title: string, message: string, onConfirm: () => void, confirmText = 'Sil') {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Vazgeç', style: 'cancel' },
    { text: confirmText, style: 'destructive', onPress: onConfirm },
  ]);
}
