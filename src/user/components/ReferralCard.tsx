import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Copy, CircleCheck as CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import type { ReferralInfo } from '../types';

interface ReferralCardProps {
  referrals: ReferralInfo;
}

export function ReferralCard({ referrals }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referrals.referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Referral Program
        </CardTitle>
        <CardDescription>Invite friends and earn bonus tokens</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{referrals.totalReferred}</p>
            <p className="text-xs text-muted-foreground">Total Referred</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{referrals.successfulConversions}</p>
            <p className="text-xs text-muted-foreground">Conversions</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{referrals.earningsFromReferrals}</p>
            <p className="text-xs text-muted-foreground">Tokens Earned</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Your Referral Link</Label>
          <div className="flex gap-2">
            <Input
              value={referrals.referralLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button onClick={copyToClipboard} size="icon" variant="outline">
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this link and earn 100 tokens for each successful referral
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
