import { SettingsClient } from "@/components/app/SettingsClient";
import { getProfile, hasGeminiApiKey } from "@/lib/data/queries";

export default async function SettingsPage() {
  const [profile, hasKey] = await Promise.all([
    getProfile(),
    hasGeminiApiKey(),
  ]);

  return <SettingsClient profile={profile} hasGeminiKey={hasKey} />;
}
