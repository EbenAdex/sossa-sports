import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading, adminOverride } = useAuth();

  if (loading) {
    return null;
  }

  if (user  || adminOverride) { 
    return children;
  }
return <Navigate to="/" replace />;
  
}

export default ProtectedRoute;