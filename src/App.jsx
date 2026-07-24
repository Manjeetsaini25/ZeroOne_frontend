import {Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from "./authSlice";
import { useEffect } from "react";
import AdminPanel from "./pages/AdminPanel.jsx";
import CreateProblem from "./components/CreateProblem.jsx"

function App() {
  const dispatch = useDispatch();
  const {isAuthenticated,loading,user} = useSelector((state)=>state.auth);

  // check initial authentication
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="relative w-16 h-16">
          {/* Outer spinning gradient ring */}
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              background:
                "conic-gradient(from 0deg, transparent, #6366f1 70%, transparent)",
              WebkitMask:
                "radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px))",
              mask:
                "radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px))",
            }}
          />

          {/* Inner pulsing dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <>
     <Routes>
      <Route path="/" element={isAuthenticated ?<Homepage></Homepage>:<Navigate to="/signup" />}></Route>
      <Route path="/login" element={isAuthenticated?<Navigate to="/" />:<Login></Login>}></Route>
      <Route path="/signup" element={isAuthenticated?<Navigate to="/" />:<Signup></Signup>}></Route>
    <Route 
        path="/admin" 
        element={
          isAuthenticated && user?.role === 'admin' ? 
            <AdminPanel /> : 
            <Navigate to="/" />
        }
      />
      <Route path="/admin/create" element={<CreateProblem />} />
       </Routes>
    </>
  )
}

export default App
