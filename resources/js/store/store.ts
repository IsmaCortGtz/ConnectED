import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth';
import { usersApi } from './slices/admin/users';
import { coursesApi } from './slices/admin/courses';
import { userCoursesApi } from './slices/user/courses';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [coursesApi.reducerPath]: coursesApi.reducer,

    [userCoursesApi.reducerPath]: userCoursesApi.reducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware()
      .concat(usersApi.middleware)
      .concat(coursesApi.middleware)
      .concat(userCoursesApi.middleware),
});

store.subscribe(() => {
  const { auth } = store.getState();
  localStorage.setItem('redux.persisted.auth', JSON.stringify(auth));
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;