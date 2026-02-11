import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth';
import { usersApi } from './slices/admin/users';
import { coursesApi } from './slices/admin/courses';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [coursesApi.reducerPath]: coursesApi.reducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware()
      .concat(usersApi.middleware)
      .concat(coursesApi.middleware),
});

store.subscribe(() => {
  const { auth } = store.getState();
  localStorage.setItem('redux.persisted.auth', JSON.stringify(auth));
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;