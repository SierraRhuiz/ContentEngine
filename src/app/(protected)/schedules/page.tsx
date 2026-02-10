import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const defaultTimes = ["9:00 AM", "12:00 PM", "5:00 PM"];

export default function SchedulesPage() {
  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Schedules</h1>
          <p className="text-sm text-muted-foreground">
            Configure when your content gets posted
          </p>
        </div>
        <Button>
          + New Schedule
        </Button>
      </div>

      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-foreground">
            <span>X (Twitter) Schedule</span>
            <Badge variant="outline">
              Inactive
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            <div>
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                Active Days
              </p>
              <div className="flex gap-2">
                {days.map((day) => (
                  <div
                    key={day}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 bg-secondary/50 text-xs text-muted-foreground transition-all duration-200 hover:border-border hover:bg-secondary cursor-pointer"
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                Posting Times
              </p>
              <div className="flex flex-wrap gap-2">
                {defaultTimes.map((time) => (
                  <Badge
                    key={time}
                    variant="outline"
                  >
                    {time}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground/70">
                Timezone: America/Mexico_City (CST)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
