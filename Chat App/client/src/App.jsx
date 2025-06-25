import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyUser } from "./redux/features/authSlice";
import { Box, CircularProgress } from "@mui/material";
import socket from "./config/socket";

// Lazy load page components
const Login = lazy(() => import('./pages/Login'));
const HomePage = lazy(() => import('./pages/HomePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  return !user ? children : <Navigate to="/home" replace />;
};

const App = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await dispatch(verifyUser()).unwrap();
        socket.emit('join', result?.user?.id);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      if (user?.id) {
        socket.emit("join", user.id);
      }
    });
    return () => {
      socket.off("connect");
    };
  }, [user?.id]);

  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: "100vw", height: '100vh' }}>
        <CircularProgress />
      </Box>}>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={user ? "/home" : "/login"} replace />}
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to={user ? "/home" : "/login"} replace />}
        />
      </Routes>
    </Suspense>
  );
};

export default App;