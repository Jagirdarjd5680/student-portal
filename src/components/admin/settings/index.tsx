"use client";

import ComponentCard from "@/components/common/component-card";
import FormAlert from "@/components/admin/shared/form-alert";
import { FormSkeleton } from "@/components/admin/shared/skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApi } from "@/hooks/use-api";
import { settingsService } from "@/services";
import InstituteTab from "./institute-tab";
import SidebarTab from "./sidebar-tab";
import SmtpTab from "./smtp-tab";

// Settings: institute details for PDFs, and email (SMTP).
export default function SettingsPage() {
  const { data, loading, error, reload } = useApi(() => settingsService.get());

  if (loading && !data) return <FormSkeleton fields={8} />;
  if (error || !data)
    return (
      <FormAlert type="error" message={error || "Could not load settings"} />
    );

  return (
    <ComponentCard title="Settings">
      <Tabs defaultValue="institute">
        <TabsList variant="line">
          <TabsTrigger value="institute">Institute & PDF Details</TabsTrigger>
          <TabsTrigger value="smtp">Email (SMTP)</TabsTrigger>
          <TabsTrigger value="sidebar">Admin Sidebar</TabsTrigger>
        </TabsList>
        <TabsContent value="institute" keepMounted className="pt-2">
          <InstituteTab initial={data} onSaved={reload} />
        </TabsContent>
        <TabsContent value="smtp" keepMounted className="pt-2">
          <SmtpTab initial={data} onSaved={reload} />
        </TabsContent>
        <TabsContent value="sidebar" className="pt-4">
          <SidebarTab initial={data} onSaved={reload} />
        </TabsContent>
      </Tabs>
    </ComponentCard>
  );
}
