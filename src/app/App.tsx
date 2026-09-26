import { Route, Routes } from "react-router";
import { AppLayout } from "./layouts/AppLayout";
import { ClassTimetablePage } from "@/features/class-timetable";
import { UsersDemoPage } from "@/features/users-demo";

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<ClassTimetablePage />} />
        <Route path="demo" element={<UsersDemoPage />} />
      </Route>
    </Routes>
  );
}
