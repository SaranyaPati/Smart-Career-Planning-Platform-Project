import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home          from "./pages/Home";
import Login         from "./pages/Login";
import Register      from "./pages/Register";
import Dashboard     from "./pages/Dashboard";
import Profile       from "./pages/Profile";
import Resume        from "./pages/Resume";
import Jobs          from "./pages/Jobs";
import Careers       from "./pages/Careers";

import PrivateRoute from "./routes/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/"                element={<Home />}           />
        <Route path="/login"    element={<Login />}    />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>}   />
        <Route path="/resume"    element={<PrivateRoute><Resume /></PrivateRoute>}    />
        <Route path="/jobs"      element={<PrivateRoute><Jobs /></PrivateRoute>}      />
        <Route path="/careers"   element={<PrivateRoute><Careers /></PrivateRoute>}  />
      </Routes>
    </BrowserRouter>
  );
}

export default App;