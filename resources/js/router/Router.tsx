import { Route, Routes } from "react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import { Error403Page } from "@/views/error/403";
import { Error404Page } from "@/views/error/404";
import LoginPage from "@/views/Login";
import HomePage from "@/views/Home";
import RegisterPage from "@/views/Register";
import { Header } from "@/components/Header";
import VideoCall from "@/views/VideoCall";

import { AdminUsers } from "@/views/admin/Users";
import { AdminCreateUser } from "@/views/admin/Users/create";
import { AdminCourses } from "@/views/admin/Courses";
import { AdminCreateCourse } from "@/views/admin/Courses/create";
import { UserCourses } from "@/views/user/Courses";
import { UserRoles } from "@/store/types/auth";

export default function Router() {
  return (
    <Routes>
      <Route element={<Header />}>
      
        {/* Public Routes */}
        <Route path="/login" Component={LoginPage} />
        <Route path="/register" Component={RegisterPage} />
        <Route path="/" Component={HomePage} />
        
        {/* Any Role */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" Component={HomePage} />
          <Route path="/video-call/:lessonId" Component={VideoCall} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute role={UserRoles.ADMIN} />}>
          <Route path="users" Component={AdminUsers} />
          <Route path="users/create" Component={AdminCreateUser} />
          <Route path="users/edit/:id" Component={AdminCreateUser} />

          <Route path="courses" Component={AdminCourses} />
          <Route path="courses/create" Component={AdminCreateCourse} />
          <Route path="courses/edit/:id" Component={AdminCreateCourse} />
        </Route>

        {/* User */}
        <Route element={<ProtectedRoute role={UserRoles.STUDENT} />}>
          <Route path="discover" Component={UserCourses} />
        </Route>

        {/* Error Pages */}
        <Route path="/error/403" Component={Error403Page} />
        <Route path="*" Component={Error404Page} />
      </Route>

    </Routes>
  );
}