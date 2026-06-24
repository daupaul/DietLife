import { redirect } from "next/navigation";

// Authenticated users land on the dashboard; proxy.ts sends guests to /login.
export default function RootPage() {
  redirect("/dashboard");
}
