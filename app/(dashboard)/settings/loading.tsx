import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-56 rounded-xl" />
      <Skeleton className="h-28 rounded-xl" />
    </div>
  );
}
