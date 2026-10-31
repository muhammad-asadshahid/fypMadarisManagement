import { useTranslation } from "react-i18next";

import { ChildrenList } from "@/components/parent/children-list";

export default function ParentPortalScreen() {
  const { t } = useTranslation();
  return <ChildrenList title={t("nav.parentPortal")} />;
}
