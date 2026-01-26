// ===================== services/api.ts =====================
export type StartParkingPayload = {
  zone: string;
  vehicleType: 'Car' | 'Bike' | 'Truck';
  vehicleNumber: string;
};

export const api = {
  login: async (payload: { email: string; password: string }) => {
    return { success: true };
  },

  signup: async (payload: {
    email: string;
    password: string;
    dob: string;
  }) => {
    console.log('SIGNUP', payload);
    return { success: true };
  },

  startParking: async (payload: StartParkingPayload) => {
    console.log('START PARKING', payload);
    return {
      sessionId: 'mock-session-id',
      startedAt: Date.now(),
    };
  },

  stopParking: async (sessionId: string) => {
    return {
      totalAmount: 0,
      duration: 0,
    };
  },
};
