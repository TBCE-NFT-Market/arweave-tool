import { Routes, Route, BrowserRouter, Outlet } from "react-router-dom";
import Home from "./routes/home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="invoices" element={<Invoices />} />
      </Routes>
    </BrowserRouter>
  );
}
function Invoices() {
  return (
    <>
      <h1>Invoices</h1>
      <Outlet />
    </>
  );
}

function Dashboard() {
  return (
    <>
      <h1>Dashboard</h1>
      <Outlet />
    </>
  );
}

export default App;
