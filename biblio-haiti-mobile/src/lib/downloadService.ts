import * as FileSystem from 'expo-file-system';

export const getLocalBookUrl = async (bookId: string, remoteUrl: string): Promise<string> => {
  const extension = remoteUrl.split('.').pop() || 'pdf';
  const fileUri = `${FileSystem.documentDirectory}book_${bookId}.${extension}`;
  
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    
    // Si le fichier existe déjà, on retourne son URI local
    if (fileInfo.exists) {
      return fileUri;
    }
    
    // Sinon, on le télécharge
    const downloadRes = await FileSystem.downloadAsync(remoteUrl, fileUri);
    if (downloadRes.status === 200) {
      return downloadRes.uri;
    }
  } catch (err) {
    console.error('Erreur lors du téléchargement du livre pour le mode offline:', err);
  }

  // En cas d'erreur ou d'échec du téléchargement, on fallback sur l'URL distante
  return remoteUrl;
};

export const deleteLocalBook = async (bookId: string, extension: string = 'pdf'): Promise<boolean> => {
  const fileUri = `${FileSystem.documentDirectory}book_${bookId}.${extension}`;
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri);
    }
    return true;
  } catch (err) {
    console.error('Erreur lors de la suppression du livre local:', err);
    return false;
  }
};
