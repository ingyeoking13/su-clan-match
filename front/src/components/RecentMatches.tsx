import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Match } from '@/types';
import { Calendar, MapPin } from 'lucide-react';

interface RecentMatchesProps {
  matches: Match[];
}

export const RecentMatches: React.FC<RecentMatchesProps> = ({ matches }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 경기</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.length === 0 ? (
            <p className="text-gray-500 text-center py-4">최근 경기가 없습니다.</p>
          ) : (
            matches.map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium">
                      {match.playerOne.nickname} vs {match.playerTwo.nickname}
                    </div>
                    {match.winner && (
                      <div className="text-sm text-green-600 font-medium">
                        승자: {match.winner.nickname}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {match.mapName}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(match.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                    {match.contestName && (
                      <div className="text-blue-600">
                        대회: {match.contestName}
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <Badge status={match.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
