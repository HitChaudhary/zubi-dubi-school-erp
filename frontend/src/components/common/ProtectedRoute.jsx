import { Navigate } from 'react-router-dom';
import { getCurrentUser, getToken, ROLE_HOME } from '../../utils/auth';

/**
 * Wrap any dashboard route with this to require a valid session.
 * If `allowedRoles` is given and the user's role isn't in it, they're
 * redirected to their own dashboard instead of the one they tried to open.
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const token = getToken();
  const user = getCurrentUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
  }

  return children;
}
