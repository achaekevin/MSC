import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute, PublicOnlyRoute } from '../components/auth/ProtectedRoute';
import { PageLoader } from '../components/ui/Skeleton';

// Public route-level code splitting & lazy loading
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

const StoriesPage = lazy(() => import('../pages/stories/StoriesPage').then(m => ({ default: m.StoriesPage })));
const StoryDetailPage = lazy(() => import('../pages/stories/StoryDetailPage').then(m => ({ default: m.StoryDetailPage })));

const EventsPage = lazy(() => import('../pages/events/EventsPage').then(m => ({ default: m.EventsPage })));
const EventDetailPage = lazy(() => import('../pages/events/EventDetailPage').then(m => ({ default: m.EventDetailPage })));

const GalleryPage = lazy(() => import('../pages/GalleryPage').then(m => ({ default: m.GalleryPage })));
const SearchPage = lazy(() => import('../pages/SearchPage').then(m => ({ default: m.SearchPage })));

const GetInvolvedPage = lazy(() => import('../pages/GetInvolvedPage').then(m => ({ default: m.GetInvolvedPage })));
const VolunteerPage = lazy(() => import('../pages/VolunteerPage').then(m => ({ default: m.VolunteerPage })));
const PartnerPage = lazy(() => import('../pages/PartnerPage').then(m => ({ default: m.PartnerPage })));

const DonatePage = lazy(() => import('../pages/DonatePage').then(m => ({ default: m.DonatePage })));
const ContactPage = lazy(() => import('../pages/ContactPage').then(m => ({ default: m.ContactPage })));

const PrivacyPage = lazy(() => import('../pages/legal/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('../pages/legal/TermsPage').then(m => ({ default: m.TermsPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Admin route-level code splitting & lazy loading
const LoginPage = lazy(() => import('../pages/admin/LoginPage').then(m => ({ default: m.default })));
const RegisterPage = lazy(() => import('../pages/admin/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('../pages/admin/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../pages/admin/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const SettingsPage = lazy(() => import('../pages/admin/SettingsPage').then(m => ({ default: m.SettingsPage })));
const UnauthorizedPage = lazy(() => import('../pages/admin/UnauthorizedPage').then(m => ({ default: m.default })));
const DashboardPage = lazy(() => import('../pages/admin/DashboardPage').then(m => ({ default: m.default })));
const ContentManagementPage = lazy(() => import('../pages/admin/ContentManagementPage').then(m => ({ default: m.ContentManagementPage })));
const ProgramsManagementPage = lazy(() => import('../pages/admin/ProgramsManagementPage').then(m => ({ default: m.ProgramsManagementPage })));
const NewsManagementPage = lazy(() => import('../pages/admin/NewsManagementPage').then(m => ({ default: m.NewsManagementPage })));
const StoriesManagementPage = lazy(() => import('../pages/admin/StoriesManagementPage').then(m => ({ default: m.StoriesManagementPage })));
const ImpactManagementPage = lazy(() => import('../pages/admin/ImpactManagementPage').then(m => ({ default: m.ImpactManagementPage })));
const EventsManagementPage = lazy(() => import('../pages/admin/EventsManagementPage').then(m => ({ default: m.EventsManagementPage })));
const GalleryManagementPage = lazy(() => import('../pages/admin/GalleryManagementPage').then(m => ({ default: m.GalleryManagementPage })));
const ApplicationsManagementPage = lazy(() => import('../pages/admin/ApplicationsManagementPage').then(m => ({ default: m.ApplicationsManagementPage })));
const TeamManagementPage = lazy(() => import('../pages/admin/TeamManagementPage').then(m => ({ default: m.TeamManagementPage })));
const UsersManagementPage = lazy(() => import('../pages/admin/UsersManagementPage').then(m => ({ default: m.UsersManagementPage })));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
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

          {/* Stories of Impact */}
          <Route path="stories" element={<StoriesPage />} />
          <Route path="stories/:slug" element={<StoryDetailPage />} />

          {/* News */}
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

          {/* Global Advanced Search */}
          <Route path="search" element={<SearchPage />} />

          {/* Legal & Compliance */}
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
        </Route>

        {/* Admin Authentication Routes */}
        <Route path="/admin/login" element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        } />
        <Route path="/admin/register" element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        } />
        <Route path="/admin/forgot-password" element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        } />
        <Route path="/admin/reset-password" element={
          <PublicOnlyRoute>
            <ResetPasswordPage />
          </PublicOnlyRoute>
        } />
        <Route path="/admin/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="content" element={<ContentManagementPage />} />
          {/* Placeholder routes for other admin pages */}
          <Route path="organization" element={<div>Organization Management - Coming Soon</div>} />
          <Route path="programs" element={<ProgramsManagementPage />} />
          <Route path="impact" element={<ImpactManagementPage />} />
          <Route path="stories" element={<StoriesManagementPage />} />
          <Route path="news" element={<NewsManagementPage />} />
          <Route path="events" element={<EventsManagementPage />} />
          <Route path="gallery" element={<GalleryManagementPage />} />
          <Route path="team" element={<TeamManagementPage />} />
          <Route path="applications" element={<ApplicationsManagementPage />} />
          <Route path="users" element={
            <ProtectedRoute requiredPermission="USER_MANAGE">
              <UsersManagementPage />
            </ProtectedRoute>
          } />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="audit" element={
            <ProtectedRoute requiredPermission="AUDIT_READ">
              <div>Audit Logs - Coming Soon</div>
            </ProtectedRoute>
          } />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
