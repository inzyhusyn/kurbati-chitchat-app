import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import brandLogo from "@/assets/kurbati-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kurbati Chitchat — Deep Dark Social" },
      { name: "description", content: "Share posts, stories and reels on Kurbati Chitchat, a sleek deep-dark social space." },
      { property: "og:title", content: "Kurbati Chitchat — Deep Dark Social" },
      { property: "og:description", content: "Share posts, stories and reels on a sleek deep-dark social space." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      navigate({ to: data.session ? "/home" : "/auth", replace: true });
    });
  }, [navigate]);
  return (
    <main className="grid min-h-screen place-items-center bg-black">
      <h1 className="sr-only">Kurbati Chitchat</h1>
      <img src={brandLogo} alt="Kurbati Chitchat" className="h-12 w-auto animate-pulse" />
    </main>
  );
}
