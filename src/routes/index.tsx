import { createFileRoute } from "@tanstack/react-router";
import { CatalogApp } from "@/components/catalog-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <CatalogApp />;
}
