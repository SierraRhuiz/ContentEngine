import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function QueuePage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Queue</h1>
        <p className="text-sm text-muted-foreground">
          Manage your scheduled and pending posts
        </p>
      </div>

      <div className="grid gap-5">
        {/* Empty State */}
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Scheduled Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <span className="text-5xl">📋</span>
              <h3 className="mt-5 text-lg font-medium text-foreground">
                No posts in queue
              </h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Create content with the Agent and add it to your queue for
                scheduling.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-border/50 bg-card p-5">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">0</p>
            <Badge variant="outline" className="mt-2">
              Draft
            </Badge>
          </Card>
          <Card className="border-border/50 bg-card p-5">
            <p className="text-sm text-muted-foreground">Scheduled</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">0</p>
            <Badge variant="outline" className="mt-2 border-primary/50 text-primary">
              Upcoming
            </Badge>
          </Card>
          <Card className="border-border/50 bg-card p-5">
            <p className="text-sm text-muted-foreground">Published</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">0</p>
            <Badge variant="outline" className="mt-2 border-green-500/50 text-green-400">
              Live
            </Badge>
          </Card>
        </div>
      </div>
    </div>
  );
}
