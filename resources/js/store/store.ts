import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth';
import { usersApi } from './slices/admin/users';
import { coursesApi } from './slices/admin/courses';
import { userCoursesApi } from './slices/user/courses';
import { lessonsApi } from './slices/admin/lesson';
import { landingApi } from './slices/admin/landing';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [coursesApi.reducerPath]: coursesApi.reducer,
    [lessonsApi.reducerPath]: lessonsApi.reducer,
    [userCoursesApi.reducerPath]: userCoursesApi.reducer,
    [landingApi.reducerPath]: landingApi.reducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware()
      .concat(
        usersApi.middleware,
        coursesApi.middleware,
        lessonsApi.middleware,
        userCoursesApi.middleware,
        landingApi.middleware,
      )
});

store.subscribe(() => {
  const { auth } = store.getState();
  localStorage.setItem('redux.persisted.auth', JSON.stringify(auth));
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;