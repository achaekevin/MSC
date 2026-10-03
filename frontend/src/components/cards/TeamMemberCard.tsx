import React from 'react';
import { TeamMember } from '../../types';
import { Card } from '../ui/Card';
import { ShieldCheck, UserCheck } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { ContentStatusBadge } from '../common/ContentStatusBadge';

interface TeamMemberCardProps {
  member: TeamMember;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member }) => {
  return (
    <Card className="flex flex-col h-full bg-white text-left relative" padding="md">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-forest-50 border border-forest-200/80 flex items-center justify-center flex-shrink-0 text-forest-800">
          {member.department === 'Board of Management' ? (
            <ShieldCheck className="w-7 h-7 text-forest-700" />
          ) : (
            <UserCheck className="w-7 h-7 text-forest-700" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
            <Badge variant={member.department === 'Board of Management' ? 'forest' : 'earth'} size="sm">
              {member.department}
            </Badge>
            {member.metadata ? (
              <ContentStatusBadge metadata={member.metadata} />
            ) : member.isPlaceholder ? (
              <ContentStatusBadge status="in_review" source="placeholder" />
            ) : null}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-charcoal-900 font-display">
            {member.name}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-forest-800">
            {member.role}
          </p>
        </div>
      </div>

      {member.bio && (
        <p className="text-sm text-charcoal-600 leading-relaxed mb-4 flex-1">
          {member.bio}
        </p>
      )}

      {member.isPlaceholder && (
        <div className="mt-auto pt-3 border-t border-warm-100">
          <p className="text-[11px] text-charcoal-400 italic">
            * Official appointee profile to be updated upon secretarial confirmation.
          </p>
        </div>
      )}
    </Card>
  );
};
