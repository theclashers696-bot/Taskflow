import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-primary/20 mb-4 select-none">404</div>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
