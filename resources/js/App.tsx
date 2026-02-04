import { BrowserRouter } from "react-router";
import Router from "@/router/Router";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { ConnectED } from "@/components/ConnectED";

function AppContent() {
  useAuth(true);
  const isInitializing = useSelector((state: RootState) => state.auth.isInitializing);

  return (
    <AnimatePresence mode="popLayout">
      {isInitializing ? (
        <ConnectED
          key="loader"
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="loading-app-animation loading"
          color="blue"
        />
      ) : (
        <Router key="router" />
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
