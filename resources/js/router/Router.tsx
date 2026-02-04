import { Route, Routes } from "react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import { Error403Page } from "@/views/error/403";
import { Error404Page } from "@/views/error/404";
import LoginPage from "@/views/Login";
import HomePage from "@/views/Home";
import RegisterPage from "@/views/Register";

export default function Router() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" Component={LoginPage} />
      <Route path="/register" Component={RegisterPage} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" Component={HomePage} />
      </Route>


      {/* Error Pages */}
      <Route path="/error/403" Component={Error403Page} />
      <Route path="*" Component={Error404Page} />
    </Routes>
  );
}