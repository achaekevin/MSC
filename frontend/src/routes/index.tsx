import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import { PageLoader } from '../components/ui/Skeleton';

// Route-level code splitting & lazy loading
const HomePage = lazy(() => import('../pages/HomePage').then(m => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('../pages/about/AboutPage').then(m => ({ default: m.AboutPage })));
const StoryPage = lazy(() => import('../pages/about/StoryPage').then(m => ({ default: m.StoryPage })));
const MissionPage = lazy(() => import('../pages/about/MissionPage').then(m => ({ default: m.MissionPage })));
const StructurePage = lazy(() => import('../pages/about/StructurePage').then(m => ({ default: m.StructurePage })));

const ProgramsPage = lazy(() => import('../pages/programs/ProgramsPage').then(m => ({ default: m.ProgramsPage })));
const ProgramDetailPage = lazy(() => import('../pages/programs/ProgramDetailPage').then(m => ({ default: m.ProgramDetailPage })));

const ImpactPage = lazy(() => import('../pages/ImpactPage').then(m => ({ default: m.ImpactPage })));
const TeamPage = lazy(() => import('../pages/TeamPage').then(m => ({ default: m.TeamPage })));

const NewsPage = lazy(() => import('../pages/news/NewsPage').then(m => ({ default: m.NewsPage })));
const NewsDetailPage = lazy(() => import('../pages/news/NewsDetailPage').then(m => ({ default: m.NewsDetailPage })));

const EventsPage = lazy(() => import('../pages/events/EventsPage').then(m => ({ default: m.EventsPage })));
const EventDetailPage = lazy(() => import('../pages/events/EventDetailPage').then(m => ({ default: m.EventDetailPage })));

const GalleryPage = lazy(() => import('../pages/GalleryPage').then(m => ({ default: m.GalleryPage })));

const GetInvolvedPage = lazy(() => import('../pages/GetInvolvedPage').then(m => ({ default: m.GetInvolvedPage })));
const VolunteerPage = lazy(() => import('../pages/VolunteerPage').then(m => ({ default: m.VolunteerPage })));
const PartnerPage = lazy(() => import('../pages/PartnerPage').then(m => ({ default: m.PartnerPage })));

const DonatePage = lazy(() => import('../pages/DonatePage').then(m => ({ default: m.DonatePage })));
const ContactPage = lazy(() => import('../pages/ContactPage').then(m => ({ default: m.ContactPage })));

const PrivacyPage = lazy(() => import('../pages/legal/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('../pages/legal/TermsPage').then(m => ({ default: m.TermsPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          {/* Home */}
          <Route index element={<HomePage />} />

          {/* About Pages & Nested Sub-routes */}
          <Route path="about" element={<AboutPage />} />
          <Route path="about/story" element={<StoryPage />} />
          <Route path="about/mission" element={<MissionPage />} />
          <Route path="about/structure" element={<StructurePage />} />

          {/* Programs */}
          <Route path="programs" element={<ProgramsPage />} />
          <Route path="programs/:slug" element={<ProgramDetailPage />} />

          {/* Impact & Team */}
          <Route path="impact" element={<ImpactPage />} />
          <Route path="team" element={<TeamPage />} />

          {/* News & Stories */}
          <Route path="news" element={<NewsPage />} />
          <Route path="news/:slug" element={<NewsDetailPage />} />

          {/* Events */}
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:slug" element={<EventDetailPage />} />

          {/* Gallery */}
          <Route path="gallery" element={<GalleryPage />} />

          {/* Get Involved, Volunteer, Partner */}
          <Route path="get-involved" element={<GetInvolvedPage />} />
          <Route path="volunteer" element={<VolunteerPage />} />
          <Route path="partner" element={<PartnerPage />} />

          {/* Giving & Contact */}
          <Route path="donate" element={<DonatePage />} />
          <Route path="contact" element={<ContactPage />} />

          {/* Legal & Compliance */}
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
