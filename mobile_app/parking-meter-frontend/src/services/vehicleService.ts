export type Vehicle = {
  id: string;
  number: string;
};

let vehicles: Vehicle[] = [];

export const vehicleService = {
  getVehicles: async (): Promise<Vehicle[]> => {
    return vehicles;
  },

  addVehicle: async (number: string): Promise<Vehicle> => {
    const newVehicle = {
      id: Date.now().toString(),
      number,
    };

    vehicles.push(newVehicle);
    return newVehicle;
  },
};
