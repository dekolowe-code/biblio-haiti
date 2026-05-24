import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export async function ensureStoragePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    // Vérifier si la permission est déjà accordée
    const readStatus = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    const writeStatus = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);

    // Retourner true si les deux permissions sont accordées
    return readStatus === RESULTS.GRANTED && writeStatus === RESULTS.GRANTED;
  } catch (error) {
    console.error('Erreur lors de la demande de permission de stockage:', error);
    return false;
  }
}

export async function checkStorageAccess(): Promise<boolean> {
  try {
    // Tester l'accès à un répertoire de base
    const docDirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory);
    if (!docDirInfo.exists) {
      return false;
    }

    // Tester la création d'un fichier temporaire
    const testPath = `${FileSystem.cacheDirectory}storage_test.txt`;
    await FileSystem.writeAsStringAsync(testPath, 'test', { encoding: FileSystem.EncodingType.UTF8 });
    await FileSystem.deleteAsync(testPath);

    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'accès au stockage:', error);
    return false;
  }
}