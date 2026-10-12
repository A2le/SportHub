import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import Teams from "./pages/Teams";
import Fixtures from "./pages/Fixtures";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/create-event"
          element={<CreateEvent />}
        />

        <Route
          path="/teams"
          element={<Teams />}
        />

        <Route
          path="/fixtures"
          element={<Fixtures />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;