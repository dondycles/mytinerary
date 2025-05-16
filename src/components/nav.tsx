import { UserType } from "@/routes/__root";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import {
  ChevronDown,
  GalleryVerticalEnd,
  LogOut,
  MoonIcon,
  SunIcon,
  User2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./animate-ui/radix/dropdown-menu";
import { Button } from "./ui/button";
export default function Nav({ user }: { user: UserType }) {
  const router = useRouter();
  const location = useLocation();
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
      hidden={location.pathname === "/"}
      className="bg-background text-muted-foreground fixed top-0 left-0 z-50 h-16 w-full border-b px-4"
    >
      <div className="mx-auto flex h-full w-full max-w-2xl items-center justify-between">
        <Link to="/itineraries" className="flex items-center gap-2">
          <GalleryVerticalEnd className="size-5" />
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" className="rounded-full" variant={"ghost"}>
              <ChevronDown className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user ? (
              <DropdownMenuItem>
                <User2 />
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
                router.navigate({ to: "/logout" });
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
