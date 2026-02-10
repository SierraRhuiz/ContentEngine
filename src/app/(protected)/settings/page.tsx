"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-provider";

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and application settings
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Profile */}
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">Name</label>
              <Input
                placeholder="Your name"
                defaultValue={profile?.full_name || ""}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">Email</label>
              <Input
                placeholder="you@example.com"
                type="email"
                defaultValue={user?.email || ""}
                disabled
              />
              <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">
                Role
              </label>
              <Input
                value={profile?.role || "member"}
                disabled
              />
            </div>
            <Button>
              Save Profile
            </Button>
          </CardContent>
        </Card>

        <div className="h-px bg-border/30" />

        {/* API Keys */}
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">API Keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">
                Apify Token
              </label>
              <Input
                type="password"
                placeholder="apify_api_..."
                defaultValue="••••••••••••••"
              />
              <p className="mt-1.5 text-xs text-muted-foreground/70">
                Used for scraping tweets from monitored accounts
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">
                AI Model Key (Kimi)
              </label>
              <Input
                type="password"
                placeholder="sk-kimi-..."
                defaultValue="••••••••••••••"
              />
              <p className="mt-1.5 text-xs text-muted-foreground/70">
                Used for AI content generation
              </p>
            </div>
            <Button variant="outline" size="sm">
              Update Keys
            </Button>
          </CardContent>
        </Card>

        <div className="h-px bg-border/30" />

        {/* Session */}
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Session</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Sign out of your current session
            </p>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </CardContent>
        </Card>

        <div className="h-px bg-border/30" />

        {/* Danger Zone */}
        <Card className="border-destructive/30 bg-card">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Permanently delete your account and all associated data.
            </p>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
