import React, { useState, useEffect } from 'react';
import { Container } from '../components/ui/Container';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { SectionHeading } from '../components/ui/SectionHeading';
import { TeamMemberCard } from '../components/cards/TeamMemberCard';
import { teamService } from '../services/teamService';
import { TeamMember } from '../types';
import { TEAM_STRUCTURE_CATEGORIES } from '../data/teamData';
import { SkeletonCard } from '../components/ui/Skeleton';
import { ShieldCheck, Heart, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const TeamPage: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    teamService.getAll().then((data) => {
      if (isMounted) {
        setTeamMembers(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredMembers =
    selectedDept === 'All'
      ? teamMembers
      : teamMembers.filter((m) => m.department === selectedDept);

  return (
    <div className="pb-20 space-y-16">
      {/* Header */}
      <section className="bg-warm-100/80 border-b border-warm-200 py-12">
        <Container>
          <Breadcrumb
            items={[
              { label: 'About Us', href: '/about' },
              { label: 'Our Team & Governance' }
            ]}
          />
          <div className="max-w-3xl text-left mt-4">
            <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-100 px-3 py-1 rounded-full border border-forest-200 inline-block mb-3">
              Leadership & Community Workforce
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-charcoal-900 font-display">
              Governance & Operational Team
            </h1>
            <p className="mt-4 text-lg text-charcoal-700 leading-relaxed">
              Our organization is steered by a dedicated Board of Management, professional coordinators, and our grassroots cadre of 40 ward-based volunteers.
            </p>
          </div>
        </Container>
      </section>

      {/* Department Filter Tabs */}
      <section>
        <Container>
          <div className="flex flex-wrap items-center gap-2 mb-10 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedDept('All')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedDept === 'All'
                  ? 'bg-forest-800 text-warm-50 shadow-sm'
                  : 'bg-white text-charcoal-700 border border-warm-200 hover:bg-warm-100'
              }`}
            >
              All Tiers ({teamMembers.length})
            </button>
            {TEAM_STRUCTURE_CATEGORIES.map((dept) => {
              const count = teamMembers.filter((m) => m.department === dept).length;
              return (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    selectedDept === dept
                      ? 'bg-forest-800 text-warm-50 shadow-sm'
                      : 'bg-white text-charcoal-700 border border-warm-200 hover:bg-warm-100'
                  }`}
                >
                  {dept} ({count})
                </button>
              );
            })}
          </div>

          {/* Source of Truth Integrity Disclaimer */}
          <div className="mb-10 p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-left flex items-start gap-3 max-w-4xl">
            <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-950 leading-relaxed">
              <span className="font-bold">Organizational Transparency Notice:</span> In strict adherence to our profile and non-profit ethics, employee names and personal biographies are displayed according to verified organizational role designations. Individual appointee details will be published upon secretarial gazettement and formal disclosure authorization.
            </div>
          </div>

          {/* Team Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          )}

          <div className="mt-14 p-8 rounded-3xl bg-forest-900 text-white text-center max-w-3xl mx-auto space-y-4">
            <h3 className="text-xl font-bold font-display text-white">
              Want to Join Our Community Volunteer Corps?
            </h3>
            <p className="text-sm text-forest-200 leading-relaxed">
              Our 40 ward volunteers are the heart of Mwancha Senior Community. We welcome passionate individuals who wish to dedicate time to protecting older persons in their localities.
            </p>
            <div className="pt-2">
              <Button to="/volunteer" variant="secondary" size="md" className="font-bold">
                Apply as a Volunteer
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
