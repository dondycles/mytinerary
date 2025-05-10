import { Link, useRouterState } from "@tanstack/react-router";
import { UserCog2 } from "lucide-react";

export default function Nav() {
  const router = useRouterState();
  return (
    <nav
      hidden={router.location.pathname === "/"}
      className="bg-muted fixed top-0 left-0 z-50 h-16 w-full px-4"
    >
      <div className="mx-auto flex h-full w-full max-w-2xl items-center justify-between">
        <Link to="/itineraries" className="flex items-center gap-2">
          <p className="text-2xl font-bold">myTinerary</p>
        </Link>
        <UserCog2 />
      </div>
    </nav>
  );
}
