


// import { Routes, Route } from "react-router-dom";
// import Home from "./pages/Home";
// import Signup from "./pages/Signup";
// import Login from "./pages/Login";
// import { useState } from "react";
// import Generator from "./pages/Generator"; 
// import Dashboard from "./pages/Dashboard";  
// import Navbar from "./components/Navbar";

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState(null); // 👈 user state

//   return (
//     <>
//       <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />

//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route
//           path="/signup"
//           element={<Signup setIsAuthenticated={setIsAuthenticated} setUser={setUser} />}
//         />
//         <Route
//           path="/login"
//           element={<Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />}
//         />
//         <Route path="/generator" element={<Generator />} />
//         <Route
//           path="/dashboard"
//           element={
//             <Dashboard 
//               user={user} 
//               onLogout={() => { setIsAuthenticated(false); setUser(null); }} 
//             />
//           }
//         />
//       </Routes>
//     </>
//   );
// }

// export default App;
import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Generator from "./pages/Generator";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // 👈 इथे fullName पण ठेवतोय

  return (
    <>
      <Navbar
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/signup"
          element={
            <Signup setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
          }
        />
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route path="/generator" element={<Generator />} />
        <Route
          path="/dashboard"
          element={
            <Dashboard
              user={user}
              onLogout={() => setIsAuthenticated(false)}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
