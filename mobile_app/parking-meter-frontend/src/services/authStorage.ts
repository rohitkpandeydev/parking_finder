import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'AUTH_TOKEN';

export const authStorage = {
  getToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem(TOKEN_KEY);
  },
  setToken: async (token: string): Promise<void> => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },
  removeToken: async (): Promise<void> => {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },
};
