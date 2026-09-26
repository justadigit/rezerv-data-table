import { Route, Routes } from "react-router";
import { AppLayout } from "./layouts/AppLayout";
import { FoundationPage } from "./routes/FoundationPage";
import { DataTablePreviewPage } from "./routes/DataTablePreviewPage";

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          index
          element={
            <FoundationPage
              routeName="Class timetable route"
              plannedFeature="Class timetable"
            />
          }
        />
        <Route path="demo" element={<DataTablePreviewPage />} />
      </Route>
    </Routes>
  );
}
