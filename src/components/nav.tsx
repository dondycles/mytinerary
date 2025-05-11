import authClient from "@/lib/auth-client";
import { UserType } from "@/routes/__root";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ChevronDown, LogOut, MoonIcon, SunIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./animate-ui/radix/dropdown-menu";
export default function Nav({ user }: { user: UserType }) {
  const router = useRouterState();
  const routerr = useRouter();
  const queryClient = useQueryClient();
  function toggleTheme() {
    if (
      document.documentElement.classList.contains("dark") ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    }
  }
  return (
    <nav
      hidden={router.location.pathname === "/"}
      className="bg-background fixed top-0 left-0 z-50 h-16 w-full border-b px-4"
    >
      <div className="mx-auto flex h-full w-full max-w-2xl items-center justify-between">
        <Link to="/itineraries" className="flex items-center gap-2">
          <p className="text-2xl font-bold">myTinerary</p>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <ChevronDown />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user ? (
              <DropdownMenuItem onClick={toggleTheme}>
                <img
                  className="size-8 rounded-full"
                  src={String(user.image)}
                  alt={user?.name}
                />
                <span>{user?.name}</span>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onClick={toggleTheme}>
              <SunIcon className="dark:hidden" />
              <MoonIcon className="hidden dark:block" />
              <span>Theme mode</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await authClient.signOut();
                await queryClient.resetQueries();
                await routerr.invalidate();
                await routerr.navigate({ to: "/" });
              }}
            >
              <LogOut />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
