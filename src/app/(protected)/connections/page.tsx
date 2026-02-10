import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ConnectionsPage() {
  const platforms = [
    {
      name: "X (Twitter)",
      icon: "𝕏",
      available: true,
      desc: "Post tweets, threads, and engage with your audience",
    },
    {
      name: "LinkedIn",
      icon: "💼",
      available: false,
      desc: "Share professional content and articles",
    },
    {
      name: "Threads",
      icon: "🧵",
      available: false,
      desc: "Post to Meta's text-based platform",
    },
    {
      name: "BlueSky",
      icon: "🦋",
      available: false,
      desc: "Connect to the decentralized social network",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Connections</h1>
        <p className="text-sm text-muted-foreground">
          Connect your social media accounts for publishing
        </p>
      </div>

      <div className="grid gap-4">
        {platforms.map((platform) => (
          <Card key={platform.name} className="border-border/50 bg-card transition-all duration-200 hover:border-border hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-foreground">
                <span className="text-2xl">{platform.icon}</span>
                {platform.name}
                {!platform.available && (
                  <Badge variant="outline">
                    Coming soon
                  </Badge>
                )}
              </CardTitle>
              <Button
                variant={platform.available ? "default" : "outline"}
                size="sm"
                disabled={!platform.available}
              >
                {platform.available ? "Connect" : "Unavailable"}
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{platform.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
