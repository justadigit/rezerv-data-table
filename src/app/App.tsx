import { Route, Routes } from "react-router";
import { AppLayout } from "./layouts/AppLayout";
import { FoundationPage } from "./routes/FoundationPage";

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
        <Route
          path="demo"
          element={
            <FoundationPage
              routeName="Reusable table demo route"
              plannedFeature="Second dataset"
            />
          }
        />
      </Route>
    </Routes>
  );
}
