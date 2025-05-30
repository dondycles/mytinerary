import Nav from "@/components/nav";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(user)")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  return (
    <>
      <Nav user={user} />
      <Outlet />
    </>
  );
}
