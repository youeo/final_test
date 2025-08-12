import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAuthToken = async () => {
  try {
    
    const token = await AsyncStorage.getItem('accessToken');
    return token;
  } catch (error) {
    console.error('Failed to get auth token from storage', error);
    return null;
  }
};