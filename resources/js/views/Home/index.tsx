import { useAuth } from "@/hooks/useAuth";
import { resetAuth } from "@/store/slices/auth";
import { useDispatch } from "react-redux";


export default function HomePage() {
  const { logout } = useAuth();

  return (
    <section>
      <h2>Home</h2>

      <button onClick={logout}>Logout</button>
    </section>
  );
}