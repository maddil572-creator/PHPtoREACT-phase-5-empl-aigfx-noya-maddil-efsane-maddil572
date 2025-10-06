import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Calendar } from 'lucide-react';
import { useDailyCheckIn } from '../hooks/useUser';
import { toast } from 'sonner';
import type { StreakInfo } from '../types';

interface StreakCardProps {
  streak: StreakInfo;
}

export function StreakCard({ streak }: StreakCardProps) {
  const checkIn = useDailyCheckIn();
  const canCheckIn = !streak.lastCheckIn ||
    new Date(streak.lastCheckIn).toDateString() !== new Date().toDateString();

  const handleCheckIn = async () => {
    try {
      const result = await checkIn.mutateAsync();
      toast.success(`Check-in successful! You earned ${result.reward} tokens.`);
    } catch (error) {
      toast.error('Check-in failed. Try again later.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Daily Streak
            </CardTitle>
            <CardDescription>Keep your streak alive to earn bonus tokens</CardDescription>
          </div>
          {canCheckIn && (
            <Button onClick={handleCheckIn} disabled={checkIn.isPending}>
              {checkIn.isPending ? 'Checking in...' : 'Check In'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{streak.current}</p>
                <p className="text-xs text-muted-foreground">Current streak</p>
              </div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{streak.longest}</p>
                <p className="text-xs text-muted-foreground">Longest streak</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Next milestone</span>
            <span className="font-medium">{streak.nextMilestone} days</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(streak.rewards).map(([days, reward]) => (
              <Badge
                key={days}
                variant={streak.current >= parseInt(days) ? "default" : "outline"}
                className="text-xs"
              >
                {days}d = {reward} tokens
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
