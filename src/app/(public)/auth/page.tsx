import { AuthShell } from "./_components/AuthShell";
import { getAuthCoreView } from "./_controllers/auth-core-controller";

type AuthPageProps = Readonly<{
  searchParams: Promise<{
    next?: string;
  }>;
}>;

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const resolvedSearchParams = await searchParams;
  const view = await getAuthCoreView({
    next: resolvedSearchParams.next
  });

  return (
    <AuthShell
      destination={view.continuation.destination}
      currentSession={view.currentSession}
      degradedMessage={view.degradedMessage}
    />
  );
}
