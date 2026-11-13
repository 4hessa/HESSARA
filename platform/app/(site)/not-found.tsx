import { NotFoundView } from "@/components/site/NotFoundView";
import { getLang } from "@/lib/i18n-server";

export default async function NotFound() {
  return <NotFoundView lang={await getLang()} />;
}
