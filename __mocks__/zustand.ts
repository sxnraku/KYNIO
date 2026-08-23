import type * as ZustandExports from 'zustand';

const { create: actualCreate, createStore: actualCreateStore } =
  jest.requireActual<typeof ZustandExports>('zustand');

export const storeResetFunctions = new Set<() => void>();

function createUncurried<T>(stateCreator: ZustandExports.StateCreator<T>) {
  const store = actualCreate(stateCreator);
  const initialState = store.getInitialState();

  storeResetFunctions.add(() => store.setState(initialState, true));
  return store;
}

function createStoreUncurried<T>(stateCreator: ZustandExports.StateCreator<T>) {
  const store = actualCreateStore(stateCreator);
  const initialState = store.getInitialState();

  storeResetFunctions.add(() => store.setState(initialState, true));
  return store;
}

export const create = (<T>(stateCreator: ZustandExports.StateCreator<T>) =>
  typeof stateCreator === 'function' ? createUncurried(stateCreator) : createUncurried) as typeof actualCreate;

export const createStore = (<T>(stateCreator: ZustandExports.StateCreator<T>) =>
  typeof stateCreator === 'function'
    ? createStoreUncurried(stateCreator)
    : createStoreUncurried) as typeof actualCreateStore;

afterEach(() => {
  storeResetFunctions.forEach((resetStore) => resetStore());
});
