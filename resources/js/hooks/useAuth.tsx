import Alert from "@/components/Alert";
import { resetAuth, setAuth, setInitializing } from "@/store/slices/auth";
import { RootState } from "@/store/store";
import axios, { AxiosError } from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router";

export function useAuth(useVerify: boolean = false) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);
  
  // Verificar sesión al cargar la app
  useEffect(() => {
    if (!useVerify) return;
    const verifySession = async () => {
      try {
        const { data } = await axios.get('/api/user');
        dispatch(setAuth(data));
      } catch (error) {
        dispatch(setInitializing(false));
      }
    };

    if (auth.isInitializing) {
      verifySession();
    }
  }, []);
  
  const isLoggedIn = () => {
    if (!auth) return false;
    if (!auth.id) return false;
    if (!auth.role) return false;
    return true;
  }

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      await axios.get('/sanctum/csrf-cookie');
      const { data } = await axios.post('/login', formData);

      dispatch(setAuth(data.user));

    } catch (e) {
      if (e instanceof AxiosError) {
        Alert.error("Error during login", e.response?.data?.message || "There was an error while trying to log in. Please try again later.");
      } else {
        Alert.error("Error during login", "There was an error while trying to log in. Please try again later.");
      }
    }
  }

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      await axios.get('/sanctum/csrf-cookie');
      const { data } = await axios.post('/register', formData);

      dispatch(setAuth(data.user));

    } catch (e) {
      if (e instanceof AxiosError) {
        Alert.error("Error during register", e.response?.data?.message || "There was an error while trying to register. Please try again later.");
      } else {
        Alert.error("Error during register", "There was an error while trying to register. Please try again later.");
      }
    }
  }

  const logout = async () => {
    try {
      await axios.post('/logout');
      dispatch(resetAuth());
      navigate('/login');
    } catch (e) {
      if (e instanceof AxiosError) {
        Alert.error("Error during logout", e.response?.data?.message || "There was an error while trying to log out. Please try again later.");
      } else {
        Alert.error("Error during logout", "There was an error while trying to log out. Please try again later.");
      }
    }
  }

  return { user: auth, login, register, logout, isLoggedIn, isInitializing: auth.isInitializing }
}