import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}
