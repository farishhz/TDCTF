"use client";

import { useEffect, useMemo } from "react";
import { Flag, Target } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Loader } from '@/shared/components';
import PageBackground from '@/shared/components/PageBackground'
import { AppTabs } from '@/shared/ui'
import EventSelect from '@/features/events/components/EventSelect'
import { useAuth } from '@/shared/contexts'
import { useEventContext } from '@/features/events/contexts/EventContext'
import { useLogs } from '@/features/logs/contexts/LogsContext'
import LogsList from "@/features/logs/components/LogsList";
import { PAGE_MAIN_CONTAINER_4XL, THEME_PRIMARY_SELECTION_CLASS } from '@/shared/styles'

export default function LogsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { markAllRead, refresh } = useLogs()
  const { startedEvents, selectedEvent, setSelectedEvent } = useEventContext()

  const tabType = useMemo(() => {
    const value = searchParams.get('tab');
    return value === 'challenges' ? 'challenges' : 'solves';
  }, [searchParams]);

  const setTabType = (tab: 'challenges' | 'solves') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (!authLoading && user) {
      refresh()
    }
  }, [authLoading, user, router, refresh]);

  useEffect(() => {
    if (tabType === 'challenges' && user) {
      markAllRead(selectedEvent)
    }
  }, [tabType, user, markAllRead, selectedEvent]);

  if (authLoading) return <Loader fullscreen />;
  if (!user) return null;

  return (
    <PageBackground
      selectionClassName={THEME_PRIMARY_SELECTION_CLASS}
      contentClassName={`${PAGE_MAIN_CONTAINER_4XL} space-y-5`}
    >
      {/* Compact Navigation Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Event Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <EventSelect
            value={selectedEvent}
            onChange={setSelectedEvent}
            events={startedEvents as any}
            className="w-full sm:min-w-[180px]"
            getEventLabel={(ev: any) => String(ev?.name ?? ev?.title ?? 'Untitled')}
          />
        </div>

        {/* Tab Switcher */}
        <AppTabs
          items={[
            { value: 'solves', label: 'Solves Feed', icon: Target },
            { value: 'challenges', label: 'Challenge Info', icon: Flag },
          ]}
          value={tabType}
          onValueChange={setTabType}
          variant="panel"
          stretch
          className="w-full sm:w-fit"
        />
      </div>

      <div
        key={`${tabType}-${selectedEvent}`}
      >
        <LogsList tabType={tabType} eventId={selectedEvent} />
      </div>
    </PageBackground>
  );
}
