import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { UserRoles, type AuthState } from '@/store/types/auth';
import { DatabaseStatus } from '../types';

const localStorageAuth = JSON.parse(localStorage.getItem('redux.persisted.auth') ?? '{}');

export interface AuthStateWithInit extends AuthState {
  isInitializing: boolean;
}

const initialState: AuthStateWithInit = {
  id: localStorageAuth.id ?? 0,
  name: localStorageAuth.name ?? '',
  last_name: localStorageAuth.last_name ?? '',
  email: localStorageAuth.email ?? '',
  role: localStorageAuth.role ?? UserRoles.STUDENT,
  status: localStorageAuth.status ?? DatabaseStatus.ACTIVE,
  isInitializing: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<AuthState>) => {
      Object.assign(state, action.payload);
      state.isInitializing = false;
    },
    updateAuth: (state, action: PayloadAction<Partial<AuthState>>) => {
      Object.assign(state, action.payload);
    },
    resetAuth: (state) => {
      state.id = 0;
      state.name = '';
      state.last_name = '';
      state.email = '';
      state.role = UserRoles.STUDENT;
      state.status = DatabaseStatus.DISABLED;
      state.isInitializing = false;
    },
    setInitializing: (state, action: PayloadAction<boolean>) => {
      state.isInitializing = action.payload;
    },
  },
});

export const { setAuth, updateAuth, resetAuth, setInitializing } = authSlice.actions;
export default authSlice.reducer;