import { AuthShell } from "./_components/AuthShell";
import { getAuthCoreView } from "./_controllers/auth-core-controller";

type AuthPageProps = Readonly<{
  searchParams: Promise<{
    next?: string;
    registered?: string;
  }>;
}>;

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const resolvedSearchParams = await searchParams;
  const view = await getAuthCoreView({
    next: resolvedSearchParams.next,
    registered: resolvedSearchParams.registered
  });

  return (
    <AuthShell
      destination={view.continuation.destination}
      primaryAction={view.primaryAction}
      currentSession={view.currentSession}
      degradedMessage={view.degradedMessage}
      publisherSurface={view.publisherSurface}
    />
  );
}
