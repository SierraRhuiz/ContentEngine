"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export interface MonitoredAccount {
  id: string;
  platform: "twitter" | "linkedin";
  username: string;
  displayName?: string;
  avatarUrl?: string;
  isOwnAccount: boolean;
  lastScrapedAt?: string;
  postCount?: number;
  newPostCount?: number;
}

interface AccountSidebarProps {
  accounts: MonitoredAccount[];
  selectedAccountId: string | null;
  selectedPlatform: "all" | "twitter" | "linkedin";
  onSelectAccount: (accountId: string | null) => void;
  onSelectPlatform: (platform: "all" | "twitter" | "linkedin") => void;
  onAddAccount: (platform: "twitter" | "linkedin", username: string, isOwnAccount: boolean) => void;
  onRemoveAccount: (accountId: string) => void;
  onRefreshAccount: (accountId: string) => void;
  isLoading: boolean;
}

export function AccountSidebar({
  accounts,
  selectedAccountId,
  selectedPlatform,
  onSelectAccount,
  onSelectPlatform,
  onAddAccount,
  onRemoveAccount,
  onRefreshAccount,
  isLoading,
}: AccountSidebarProps) {
  const [newUsername, setNewUsername] = useState("");
  const [newPlatform, setNewPlatform] = useState<"twitter" | "linkedin">("twitter");
  const [isOwnAccount, setIsOwnAccount] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddAccount = () => {
    if (!newUsername.trim()) return;
    onAddAccount(newPlatform, newUsername.replace("@", "").trim(), isOwnAccount);
    setNewUsername("");
    setIsOwnAccount(false);
    setShowAddForm(false);
  };

  const twitterAccounts = accounts.filter((a) => a.platform === "twitter");
  const linkedinAccounts = accounts.filter((a) => a.platform === "linkedin");
  const ownAccounts = accounts.filter((a) => a.isOwnAccount);

  return (
    <div className="flex h-full w-80 flex-col border-r border-border/30">
      {/* Platform Filter */}
      <div className="border-b border-border/30 p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Filter by Platform</p>
        <div className="flex gap-2">
          {(["all", "twitter", "linkedin"] as const).map((platform) => (
            <Button
              key={platform}
              size="sm"
              variant={selectedPlatform === platform ? "default" : "outline"}
              onClick={() => {
                onSelectPlatform(platform);
                onSelectAccount(null);
              }}
            >
              {platform === "all" ? "All" : platform === "twitter" ? "𝕏" : "💼"}
            </Button>
          ))}
        </div>
      </div>

      {/* Add Account Button */}
      <div className="border-b border-border/30 p-4">
        {showAddForm ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={newPlatform === "twitter" ? "default" : "outline"}
                onClick={() => setNewPlatform("twitter")}
              >
                𝕏
              </Button>
              <Button
                size="sm"
                variant={newPlatform === "linkedin" ? "default" : "outline"}
                onClick={() => setNewPlatform("linkedin")}
                className={newPlatform === "linkedin" ? "bg-blue-700" : ""}
              >
                💼
              </Button>
            </div>
            <Input
              placeholder={newPlatform === "twitter" ? "@username" : "profile URL or username"}
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddAccount()}
            />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={isOwnAccount}
                onChange={(e) => setIsOwnAccount(e.target.checked)}
                className="rounded border-border"
              />
              This is my account (for tone matching)
            </label>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddAccount}
                disabled={!newUsername.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? "Adding..." : "Add"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full"
          >
            + Add Account
          </Button>
        )}
      </div>

      {/* Account Lists */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Own Accounts (Tone Matching) */}
          {ownAccounts.length > 0 && (
            <>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                🎯 Your Accounts (Tone Matching)
              </p>
              <div className="mb-4 space-y-2">
                {ownAccounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    isSelected={selectedAccountId === account.id}
                    onSelect={() => onSelectAccount(account.id)}
                    onRefresh={() => onRefreshAccount(account.id)}
                    onRemove={() => onRemoveAccount(account.id)}
                  />
                ))}
              </div>
              <div className="mb-4 h-px bg-border/30" />
            </>
          )}

          {/* Twitter Accounts */}
          {(selectedPlatform === "all" || selectedPlatform === "twitter") &&
            twitterAccounts.filter((a) => !a.isOwnAccount).length > 0 && (
              <>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  𝕏 Twitter Accounts
                </p>
                <div className="mb-4 space-y-2">
                  {twitterAccounts
                    .filter((a) => !a.isOwnAccount)
                    .map((account) => (
                      <AccountCard
                        key={account.id}
                        account={account}
                        isSelected={selectedAccountId === account.id}
                        onSelect={() => onSelectAccount(account.id)}
                        onRefresh={() => onRefreshAccount(account.id)}
                        onRemove={() => onRemoveAccount(account.id)}
                      />
                    ))}
                </div>
              </>
            )}

          {/* LinkedIn Accounts */}
          {(selectedPlatform === "all" || selectedPlatform === "linkedin") &&
            linkedinAccounts.filter((a) => !a.isOwnAccount).length > 0 && (
              <>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  💼 LinkedIn Accounts
                </p>
                <div className="space-y-2">
                  {linkedinAccounts
                    .filter((a) => !a.isOwnAccount)
                    .map((account) => (
                      <AccountCard
                        key={account.id}
                        account={account}
                        isSelected={selectedAccountId === account.id}
                        onSelect={() => onSelectAccount(account.id)}
                        onRefresh={() => onRefreshAccount(account.id)}
                        onRemove={() => onRemoveAccount(account.id)}
                      />
                    ))}
                </div>
              </>
            )}

          {accounts.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No accounts added yet.
              <br />
              Add Twitter or LinkedIn accounts to start monitoring.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function AccountCard({
  account,
  isSelected,
  onSelect,
  onRefresh,
  onRemove,
}: {
  account: MonitoredAccount;
  isSelected: boolean;
  onSelect: () => void;
  onRefresh: () => void;
  onRemove: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <Card
      className={`cursor-pointer border-border/50 bg-card transition-all duration-200 hover:border-border hover:bg-accent/30 ${
        isSelected ? "border-primary/50 bg-primary/5" : ""
      }`}
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {account.avatarUrl ? (
            <img
              src={account.avatarUrl}
              alt={account.username}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-lg">
              {account.platform === "twitter" ? "𝕏" : "💼"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {account.displayName || account.username}
            </p>
            <p className="text-xs text-muted-foreground">@{account.username}</p>
          </div>
          <div className="flex items-center gap-2">
            {account.newPostCount && account.newPostCount > 0 && (
              <Badge className="bg-green-600 text-xs">{account.newPostCount}</Badge>
            )}
            {isSelected && <Badge className="text-xs">Active</Badge>}
          </div>
        </div>

        {showActions && (
          <div className="mt-2 flex gap-2">
            <Button
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onRefresh();
              }}
              className="flex-1"
            >
              🔄 Refresh
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="text-destructive hover:bg-destructive/10"
            >
              ✕
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
