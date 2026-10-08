import React from 'react';
import { Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, fonts } from '@/constants/petTheme';

type Props = { uri?: string; onChange: (uri: string) => void; size?: number };

/** Quadrado tracejado "Adicionar foto" (câmera ou galeria). Requer expo-image-picker. */
export function PhotoPicker({ uri, onChange, size = 145 }: Props) {
  const handleResult = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets[0]) onChange(result.assets[0].uri);
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    handleResult(result);
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à câmera para tirar a foto.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    handleResult(result);
  };

  const handlePress = () => {
    if (Platform.OS === 'web') return openGallery();
    Alert.alert('Adicionar foto', 'Escolha a origem da imagem.', [
      { text: 'Câmera', onPress: openCamera },
      { text: 'Galeria', onPress: openGallery },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const box = { width: size, height: size, borderRadius: size * 0.24 };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity activeOpacity={0.85} onPress={handlePress} accessibilityLabel="Adicionar foto do pet">
        {uri ? (
          <View style={[box, styles.filled]}>
            <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" />
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </View>
        ) : (
          <View style={[box, styles.empty]}>
            <Ionicons name="camera-outline" size={30} color={colors.primary} />
            <Text style={styles.title}>Adicionar foto</Text>
            <Text style={styles.hint}>Câmera ou galeria</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', marginBottom: 20 },
  empty: {
    backgroundColor: colors.primaryLight, borderWidth: 1.2, borderStyle: 'dashed',
    borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  filled: { overflow: 'hidden', borderWidth: 4, borderColor: colors.surface, backgroundColor: colors.primaryLight },
  title: { fontFamily: fonts.bold, fontSize: 13, color: colors.primary, marginTop: 6 },
  hint: { fontFamily: fonts.medium, fontSize: 10, color: colors.textMuted },
  editBadge: {
    position: 'absolute', right: 8, bottom: 8, width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
});
