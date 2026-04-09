import { redirect } from "next/navigation";

import { StudioShell } from "./_components/StudioShell";
import { createStudioPrepView } from "./_controllers/studio-prep-controller";

export default async function StudioPage() {
  const view = await createStudioPrepView();

  if (view.kind === "redirect_auth") {
    redirect("/auth?next=/studio");
  }

  return <StudioShell view={view} />;
}
