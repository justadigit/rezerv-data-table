import { Route, Routes } from "react-router";
import { AppLayout } from "./layouts/AppLayout";
import { DataTablePreviewPage } from "./routes/DataTablePreviewPage";
import { ClassTimetablePage } from "@/features/class-timetable";

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<ClassTimetablePage />} />
        <Route path="demo" element={<DataTablePreviewPage />} />
      </Route>
    </Routes>
  );
}
