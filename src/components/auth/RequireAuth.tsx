import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../state/auth";

/**
 * Gate for the `/app` branch. While the session is resolving we show a brief
 * loader (avoids a flash-redirect on refresh). Unauthenticated visitors are sent
 * to `/login` with the intended path preserved so they land where they meant to.
 * Guests (anonymous sessions) count as authenticated.
 *
 * If Supabase isn't configured (`ready === false`), the app can't hold a session,
 * so we let visitors through to keep the showcase usable local-first.
 */
export function RequireAuth() {
  const auth = useAuth();
  const location = useLocation();

  if (auth.ready && auth.loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[color:var(--color-ink)] text-white">
        <Loader2 className="animate-spin text-[#1db954]" size={32} />
      </div>
    );
  }

  if (auth.ready && !auth.session) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
}
