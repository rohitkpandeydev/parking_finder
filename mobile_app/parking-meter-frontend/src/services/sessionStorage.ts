import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'ACTIVE_PARKING_SESSION';

export const sessionStorage = {
  save: async (session: any) => {
    await AsyncStorage.setItem(KEY, JSON.stringify(session));
  },

  load: async () => {
    const value = await AsyncStorage.getItem(KEY);
    return value ? JSON.parse(value) : null;
  },

  clear: async () => {
    await AsyncStorage.removeItem(KEY);
  },
};
