import { TwitterAgentTester } from '@/components/twitter-agent-tester';

export default function TwitterAgentPage() {
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Twitter Agent</h1>
        <p className="text-muted-foreground">
          Input → Analyze pipeline for automated Twitter content generation.
        </p>
      </div>
      
      <TwitterAgentTester />
    </div>
  );
}
