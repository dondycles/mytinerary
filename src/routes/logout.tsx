import authClient from "@/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/logout")({
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/" });
    }
  },

  component: RouteComponent,
});

function RouteComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    const logOut = async () => {
      await authClient.signOut();
      await queryClient.resetQueries();
      location.reload();
    };
    const timeOut = setTimeout(() => logOut(), 1000);
    return () => clearTimeout(timeOut);
  }, [queryClient]);
  return (
    <div className="flex h-dvh w-full items-center justify-center p-4">
      <div className="text-muted-foreground flex flex-col items-center gap-2 text-sm">
        <Loader2 className="size-16 animate-spin" />
        <p>Logging out...</p>
      </div>
    </div>
  );
}
