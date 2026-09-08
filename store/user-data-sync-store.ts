import { create } from "zustand";

interface UserDataSyncState {
  dataVersion: number;
  weightVersion: number;
  mealsVersion: number;
  workoutsVersion: number;
  notifyWeightChanged: () => void;
  notifyMealsChanged: () => void;
  notifyWorkoutsChanged: () => void;
  notifyAllChanged: () => void;
}

/**
 * Store global de sincronização reativa local.
 * Notifica componentes em tempo real quando registos de peso, refeições
 * ou treinos são inseridos, atualizados ou apagados no SQLite.
 */
export const useUserDataSyncStore = create<UserDataSyncState>((set) => ({
  dataVersion: 0,
  weightVersion: 0,
  mealsVersion: 0,
  workoutsVersion: 0,

  notifyWeightChanged: () =>
    set((state) => ({
      dataVersion: state.dataVersion + 1,
      weightVersion: state.weightVersion + 1,
    })),

  notifyMealsChanged: () =>
    set((state) => ({
      dataVersion: state.dataVersion + 1,
      mealsVersion: state.mealsVersion + 1,
    })),

  notifyWorkoutsChanged: () =>
    set((state) => ({
      dataVersion: state.dataVersion + 1,
      workoutsVersion: state.workoutsVersion + 1,
    })),

  notifyAllChanged: () =>
    set((state) => ({
      dataVersion: state.dataVersion + 1,
      mealsVersion: state.mealsVersion + 1,
      weightVersion: state.weightVersion + 1,
      workoutsVersion: state.workoutsVersion + 1,
    })),
}));
