import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import authClient from "@/lib/auth-client";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
  loader: ({ context }) => {
    return { user: context.user };
  },
});

function Home() {
  const { queryClient } = Route.useRouteContext();
  const { user } = Route.useLoaderData();
  const router = useRouter();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-10 p-2">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold sm:text-4xl">myTinerary</h1>
        <p>Simplest way to create a travel itinerary with your friends.</p>
      </div>

      {user ? (
        <div className="flex flex-col items-center gap-2">
          <p>Welcome back, {user.name}!</p>
          <div className="flex gap-2">
            <Button type="button" asChild>
              <Link to="/itineraries">Itineraries</Link>
            </Button>
            <Button
              onClick={async () => {
                await authClient.signOut();
                await queryClient.invalidateQueries({ queryKey: ["user"] });
                await router.invalidate();
              }}
              type="button"
              variant="destructive"
            >
              Sign out
            </Button>
            <ThemeToggle />
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() =>
              authClient.signIn.social({
                provider: "google",
                callbackURL: "/itineraries",
              })
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Login with Google
          </Button>
          <ThemeToggle />
        </div>
      )}
    </div>
  );
}
