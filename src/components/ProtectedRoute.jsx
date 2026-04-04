import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../Context Api/AuthContext";
import LoadingScreen from "./LoadingScreen";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <LoadingScreen message="Verifying access..." />;

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
}
