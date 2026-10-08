import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requireRoles, requirePermissions } from '../middleware/authorize.js';
import { uploadMedia, validateFileMagicBytes } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';

import { dashboardController } from '../controllers/dashboard.controller.js';
import { organizationController } from '../controllers/organization.controller.js';
import { programController } from '../controllers/program.controller.js';
import { newsController } from '../controllers/news.controller.js';
import { eventController } from '../controllers/event.controller.js';
import { teamController } from '../controllers/team.controller.js';
import { impactController } from '../controllers/impact.controller.js';
import { galleryController } from '../controllers/gallery.controller.js';
import { formController } from '../controllers/form.controller.js';
import { donationController } from '../controllers/donation.controller.js';
import { reviewController } from '../controllers/review.controller.js';
import { auditController } from '../controllers/audit.controller.js';
import { testimonialController } from '../controllers/testimonial.controller.js';
import { storyController } from '../controllers/story.controller.js';
import { userController } from '../controllers/user.controller.js';
import { notificationController } from '../controllers/notification.controller.js';
import { backupController } from '../controllers/backup.controller.js';

import {
  createProgramSchema,
  updateProgramSchema,
  createNewsSchema,
  updateNewsSchema,
  createEventSchema,
  updateEventSchema,
  createTeamMemberSchema,
  updateTeamMemberSchema,
  createImpactMetricSchema,
  updateImpactMetricSchema,
  updateOrganizationSchema,
  createTestimonialSchema,
  updateTestimonialSchema,
  createStorySchema,
  updateStorySchema
} from '../schemas/content.schema.js';
import {
  formStatusUpdateSchema,
  contactStatusUpdateSchema
} from '../schemas/form.schema.js';
import {
  requestChangesSchema,
  approveContentSchema,
  publishContentSchema,
  clientSignoffSchema
} from '../schemas/review.schema.js';
import {
  createUserSchema,
  setUserActiveStatusSchema,
  setUserRoleSchema,
  adminResetPasswordSchema
} from '../schemas/auth.schema.js';

const router = Router();

// Protect ALL admin routes with authentication
router.use(authenticate);

// ----------------------------------------------------
// DASHBOARD (Section 70)
// ----------------------------------------------------
router.get('/dashboard', requireRoles('SUPER_ADMIN', 'CONTENT_ADMIN'), (req, res, next) => dashboardController.getDashboardSummary(req, res, next));

// ----------------------------------------------------
// ORGANIZATION (Section 13)
// ----------------------------------------------------
router.get('/organization', (req, res, next) => organizationController.getAdminOrganization(req, res, next));
router.put(
  '/organization',
  requirePermissions('SETTINGS_MANAGE'),
  validate({ body: updateOrganizationSchema }),
  (req, res, next) => organizationController.updateOrganization(req, res, next)
);

// ----------------------------------------------------
// PROGRAMS (Section 14)
// ----------------------------------------------------
router.get('/programs', (req, res, next) => programController.getAdminPrograms(req, res, next));
router.get('/programs/categories', (req, res, next) => programController.getPublicCategories(req, res, next));
router.get('/programs/:id', (req, res, next) => programController.getAdminProgramById(req, res, next));
router.post(
  '/programs',
  requirePermissions('CONTENT_CREATE'),
  validate({ body: createProgramSchema }),
  (req, res, next) => programController.createProgram(req, res, next)
);
router.put(
  '/programs/:id',
  requirePermissions('CONTENT_UPDATE'),
  validate({ body: updateProgramSchema }),
  (req, res, next) => programController.updateProgram(req, res, next)
);
router.delete(
  '/programs/:id',
  requirePermissions('CONTENT_DELETE'),
  (req, res, next) => programController.deleteProgram(req, res, next)
);
router.post('/programs/:id/submit-review', (req, res, next) => programController.submitReview(req, res, next));
router.post(
  '/programs/:id/approve',
  requirePermissions('CONTENT_APPROVE'),
  (req, res, next) => programController.approveProgram(req, res, next)
);
router.post(
  '/programs/:id/publish',
  requirePermissions('CONTENT_PUBLISH'),
  (req, res, next) => programController.publishProgram(req, res, next)
);

// ----------------------------------------------------
// NEWS (Section 18)
// ----------------------------------------------------
router.get('/news', (req, res, next) => newsController.getAdminNews(req, res, next));
router.get('/news/categories', (req, res, next) => newsController.getPublicCategories(req, res, next));
router.get('/news/:id', (req, res, next) => newsController.getAdminNewsById(req, res, next));
router.post(
  '/news',
  requirePermissions('CONTENT_CREATE'),
  validate({ body: createNewsSchema }),
  (req, res, next) => newsController.createNews(req, res, next)
);
router.put(
  '/news/:id',
  requirePermissions('CONTENT_UPDATE'),
  validate({ body: updateNewsSchema }),
  (req, res, next) => newsController.updateNews(req, res, next)
);
router.delete(
  '/news/:id',
  requirePermissions('CONTENT_DELETE'),
  (req, res, next) => newsController.deleteNews(req, res, next)
);
router.post('/news/:id/submit-review', (req, res, next) => newsController.submitReview(req, res, next));
router.post(
  '/news/:id/approve',
  requirePermissions('CONTENT_APPROVE'),
  (req, res, next) => newsController.approveNews(req, res, next)
);
router.post(
  '/news/:id/publish',
  requirePermissions('CONTENT_PUBLISH'),
  (req, res, next) => newsController.publishNews(req, res, next)
);

// ----------------------------------------------------
// EVENTS (Section 19)
// ----------------------------------------------------
router.get('/events', (req, res, next) => eventController.getAdminEvents(req, res, next));
router.get('/events/categories', (req, res, next) => eventController.getPublicCategories(req, res, next));
router.get('/events/:id', (req, res, next) => eventController.getAdminEventById(req, res, next));
router.post(
  '/events',
  requirePermissions('CONTENT_CREATE'),
  validate({ body: createEventSchema }),
  (req, res, next) => eventController.createEvent(req, res, next)
);
router.put(
  '/events/:id',
  requirePermissions('CONTENT_UPDATE'),
  validate({ body: updateEventSchema }),
  (req, res, next) => eventController.updateEvent(req, res, next)
);
router.delete(
  '/events/:id',
  requirePermissions('CONTENT_DELETE'),
  (req, res, next) => eventController.deleteEvent(req, res, next)
);
router.post('/events/:id/submit-review', (req, res, next) => eventController.submitReview(req, res, next));
router.post(
  '/events/:id/approve',
  requirePermissions('CONTENT_APPROVE'),
  (req, res, next) => eventController.approveEvent(req, res, next)
);
router.post(
  '/events/:id/publish',
  requirePermissions('CONTENT_PUBLISH'),
  (req, res, next) => eventController.publishEvent(req, res, next)
);
router.post(
  '/events/:id/duplicate',
  requirePermissions('CONTENT_CREATE'),
  (req, res, next) => eventController.duplicateEvent(req, res, next)
);

// ----------------------------------------------------
// TEAM (Section 16)
// ----------------------------------------------------
router.get('/team', (req, res, next) => teamController.getAdminTeam(req, res, next));
router.post(
  '/team',
  requirePermissions('CONTENT_CREATE'),
  validate({ body: createTeamMemberSchema }),
  (req, res, next) => teamController.createTeamMember(req, res, next)
);
router.put(
  '/team/:id',
  requirePermissions('CONTENT_UPDATE'),
  validate({ body: updateTeamMemberSchema }),
  (req, res, next) => teamController.updateTeamMember(req, res, next)
);
router.delete(
  '/team/:id',
  requirePermissions('CONTENT_DELETE'),
  (req, res, next) => teamController.deleteTeamMember(req, res, next)
);
router.post('/team/:id/submit-review', (req, res, next) => teamController.submitReview(req, res, next));
router.post(
  '/team/:id/approve',
  requirePermissions('CONTENT_APPROVE'),
  (req, res, next) => teamController.approveTeamMember(req, res, next)
);
router.post(
  '/team/:id/publish',
  requirePermissions('CONTENT_PUBLISH'),
  (req, res, next) => teamController.publishTeamMember(req, res, next)
);

// ----------------------------------------------------
// IMPACT (Section 15)
// ----------------------------------------------------
router.get('/impact', (req, res, next) => impactController.getAdminMetrics(req, res, next));
router.post(
  '/impact',
  requirePermissions('CONTENT_CREATE'),
  validate({ body: createImpactMetricSchema }),
  (req, res, next) => impactController.createMetric(req, res, next)
);
router.put(
  '/impact/:id',
  requirePermissions('CONTENT_UPDATE'),
  validate({ body: updateImpactMetricSchema }),
  (req, res, next) => impactController.updateMetric(req, res, next)
);
router.post(
  '/impact/:id/approve',
  requirePermissions('CONTENT_APPROVE'),
  (req, res, next) => impactController.approveMetric(req, res, next)
);
router.post('/impact/:id/submit-review', (req, res, next) => impactController.submitReview(req, res, next));
router.post(
  '/impact/:id/publish',
  requirePermissions('CONTENT_PUBLISH'),
  (req, res, next) => impactController.publishMetric(req, res, next)
);
router.delete(
  '/impact/:id',
  requirePermissions('CONTENT_DELETE'),
  (req, res, next) => impactController.deleteMetric(req, res, next)
);

// ----------------------------------------------------
// MEDIA & GALLERY (Section 20 & 21)
// ----------------------------------------------------
router.get('/media', (req, res, next) => galleryController.getAdminMedia(req, res, next));
router.get('/media/albums', (req, res, next) => galleryController.getPublicAlbums(req, res, next));
router.post(
  '/media/albums',
  requirePermissions('MEDIA_MANAGE'),
  (req, res, next) => galleryController.createAlbum(req, res, next)
);
router.post(
  '/media/upload',
  requirePermissions('MEDIA_MANAGE'),
  uploadMedia.single('file'),
  validateFileMagicBytes,
  (req, res, next) => galleryController.uploadMedia(req, res, next)
);
router.put(
  '/media/:id',
  requirePermissions('MEDIA_MANAGE'),
  (req, res, next) => galleryController.updateMedia(req, res, next)
);
router.delete(
  '/media/:id',
  requirePermissions('MEDIA_MANAGE'),
  (req, res, next) => galleryController.deleteMedia(req, res, next)
);
router.post('/media/:id/submit-review', (req, res, next) => galleryController.submitReview(req, res, next));
router.post(
  '/media/:id/approve',
  requirePermissions('CONTENT_APPROVE'),
  (req, res, next) => galleryController.approveMedia(req, res, next)
);
router.post(
  '/media/:id/publish',
  requirePermissions('CONTENT_PUBLISH'),
  (req, res, next) => galleryController.publishMedia(req, res, next)
);

// ----------------------------------------------------
// FORM MANAGEMENT (Section 71)
// ----------------------------------------------------
router.get(
  '/contact-submissions',
  requirePermissions('FORM_READ'),
  (req, res, next) => formController.getContactSubmissions(req, res, next)
);
router.patch(
  '/contact-submissions/:id/status',
  requirePermissions('FORM_UPDATE'),
  validate({ body: contactStatusUpdateSchema }),
  (req, res, next) => formController.updateContactStatus(req, res, next)
);

router.get(
  '/volunteer-applications',
  requirePermissions('FORM_READ'),
  (req, res, next) => formController.getVolunteerApplications(req, res, next)
);
router.patch(
  '/volunteer-applications/:id/status',
  requirePermissions('FORM_UPDATE'),
  validate({ body: formStatusUpdateSchema }),
  (req, res, next) => formController.updateVolunteerStatus(req, res, next)
);

router.get(
  '/partnership-applications',
  requirePermissions('FORM_READ'),
  (req, res, next) => formController.getPartnershipApplications(req, res, next)
);
router.patch(
  '/partnership-applications/:id/status',
  requirePermissions('FORM_UPDATE'),
  validate({ body: formStatusUpdateSchema }),
  (req, res, next) => formController.updatePartnershipStatus(req, res, next)
);

// ----------------------------------------------------
// DONATION CONFIGURATION (Section 25)
// ----------------------------------------------------
router.get('/donations/config', (req, res, next) => donationController.getAdminConfigs(req, res, next));
router.put(
  '/donations/config/:id',
  requirePermissions('SETTINGS_MANAGE'),
  (req, res, next) => donationController.updateConfig(req, res, next)
);

// ----------------------------------------------------
// CONTENT APPROVAL WORKFLOW (Section 9, 10, 11, 54, 55, 75)
// ----------------------------------------------------
router.get(
  '/review/pending',
  requirePermissions('CONTENT_REVIEW'),
  (req, res, next) => reviewController.getPendingReviews(req, res, next)
);
router.post(
  '/review/:entityType/:id/request-changes',
  requirePermissions('CONTENT_REVIEW'),
  validate({ body: requestChangesSchema }),
  (req, res, next) => reviewController.requestChanges(req, res, next)
);
router.post(
  '/review/:entityType/:id/approve',
  requirePermissions('CONTENT_APPROVE'),
  validate({ body: approveContentSchema }),
  (req, res, next) => reviewController.approveContent(req, res, next)
);
router.post(
  '/review/:entityType/:id/publish',
  requirePermissions('CONTENT_PUBLISH'),
  validate({ body: publishContentSchema }),
  (req, res, next) => reviewController.publishContent(req, res, next)
);
router.post(
  '/review/signoff',
  requireRoles('SUPER_ADMIN'),
  validate({ body: clientSignoffSchema }),
  (req, res, next) => reviewController.recordClientSignoff(req, res, next)
);
router.get(
  '/review/revisions/:entityType/:id',
  requirePermissions('CONTENT_READ'),
  (req, res, next) => reviewController.getRevisions(req, res, next)
);

// ----------------------------------------------------
// TESTIMONIALS (Beneficiary Safeguards)
// ----------------------------------------------------
router.get('/testimonials', (req, res, next) => testimonialController.getAdminTestimonials(req, res, next));
router.post(
  '/testimonials',
  requirePermissions('CONTENT_CREATE'),
  validate({ body: createTestimonialSchema }),
  (req, res, next) => testimonialController.createTestimonial(req, res, next)
);
router.put(
  '/testimonials/:id',
  requirePermissions('CONTENT_UPDATE'),
  validate({ body: updateTestimonialSchema }),
  (req, res, next) => testimonialController.updateTestimonial(req, res, next)
);
router.delete(
  '/testimonials/:id',
  requirePermissions('CONTENT_DELETE'),
  (req, res, next) => testimonialController.deleteTestimonial(req, res, next)
);
router.post(
  '/testimonials/:id/approve',
  requirePermissions('CONTENT_APPROVE'),
  (req, res, next) => testimonialController.approveTestimonial(req, res, next)
);
router.post(
  '/testimonials/:id/publish',
  requirePermissions('CONTENT_PUBLISH'),
  (req, res, next) => testimonialController.publishTestimonial(req, res, next)
);

// ----------------------------------------------------
// SUCCESS STORIES (Beneficiary Safeguards)
// ----------------------------------------------------
router.get('/stories', (req, res, next) => storyController.getAdminStories(req, res, next));
router.post(
  '/stories',
  requirePermissions('CONTENT_CREATE'),
  validate({ body: createStorySchema }),
  (req, res, next) => storyController.createStory(req, res, next)
);
router.put(
  '/stories/:id',
  requirePermissions('CONTENT_UPDATE'),
  validate({ body: updateStorySchema }),
  (req, res, next) => storyController.updateStory(req, res, next)
);
router.delete(
  '/stories/:id',
  requirePermissions('CONTENT_DELETE'),
  (req, res, next) => storyController.deleteStory(req, res, next)
);
router.post(
  '/stories/:id/approve',
  requirePermissions('CONTENT_APPROVE'),
  (req, res, next) => storyController.approveStory(req, res, next)
);
router.post(
  '/stories/:id/publish',
  requirePermissions('CONTENT_PUBLISH'),
  (req, res, next) => storyController.publishStory(req, res, next)
);

// ----------------------------------------------------
// USER MANAGEMENT (Section 72 - Super Admin Only)
// ----------------------------------------------------
router.get(
  '/users',
  requireRoles('SUPER_ADMIN'),
  (req, res, next) => userController.getUsers(req, res, next)
);
router.post(
  '/users',
  requireRoles('SUPER_ADMIN'),
  validate({ body: createUserSchema }),
  (req, res, next) => userController.createUser(req, res, next)
);
router.patch(
  '/users/:id/status',
  requireRoles('SUPER_ADMIN'),
  validate({ body: setUserActiveStatusSchema }),
  (req, res, next) => userController.setUserActiveStatus(req, res, next)
);
router.patch(
  '/users/:id/role',
  requireRoles('SUPER_ADMIN'),
  validate({ body: setUserRoleSchema }),
  (req, res, next) => userController.setUserRole(req, res, next)
);
router.post(
  '/users/:id/reset-password',
  requireRoles('SUPER_ADMIN'),
  validate({ body: adminResetPasswordSchema }),
  (req, res, next) => userController.adminResetPassword(req, res, next)
);
router.post(
  '/users/:id/revoke-sessions',
  requireRoles('SUPER_ADMIN'),
  (req, res, next) => userController.revokeUserSessions(req, res, next)
);

// ----------------------------------------------------
// AUDIT LOGS (Section 43)
// ----------------------------------------------------
router.get(
  '/audit',
  requirePermissions('AUDIT_READ'),
  (req, res, next) => auditController.getAuditLogs(req, res, next)
);

// ----------------------------------------------------
// NOTIFICATION CENTER
// ----------------------------------------------------
router.get(
  '/notifications',
  (req, res, next) => notificationController.getSummary(req, res, next)
);
router.patch(
  '/notifications/:id/read',
  (req, res, next) => notificationController.markAsRead(req, res, next)
);
router.patch(
  '/notifications/mark-all-read',
  (req, res, next) => notificationController.markAllAsRead(req, res, next)
);

// ----------------------------------------------------
// AUTOMATED BACKUPS & DISASTER RECOVERY
// ----------------------------------------------------
router.get(
  '/backups',
  requireRoles('SUPER_ADMIN'),
  (req, res, next) => backupController.getOverview(req, res, next)
);
router.post(
  '/backups/create',
  requireRoles('SUPER_ADMIN'),
  (req, res, next) => backupController.createBackup(req, res, next)
);
router.post(
  '/backups/:id/test-restore',
  requireRoles('SUPER_ADMIN'),
  (req, res, next) => backupController.testRestore(req, res, next)
);
router.post(
  '/backups/:id/restore',
  requireRoles('SUPER_ADMIN'),
  (req, res, next) => backupController.restoreDatabase(req, res, next)
);
router.get(
  '/backups/:id/download',
  requireRoles('SUPER_ADMIN'),
  (req, res, next) => backupController.downloadBackup(req, res, next)
);
router.delete(
  '/backups/:id',
  requireRoles('SUPER_ADMIN'),
  (req, res, next) => backupController.deleteBackup(req, res, next)
);
router.get(
  '/backups/media/manifest',
  requireRoles('SUPER_ADMIN', 'CONTENT_ADMIN'),
  (req, res, next) => backupController.getMediaManifest(req, res, next)
);
router.get(
  '/backups/media/export',
  requireRoles('SUPER_ADMIN', 'CONTENT_ADMIN'),
  (req, res, next) => backupController.exportMediaManifest(req, res, next)
);
router.get(
  '/backups/media/health',
  requireRoles('SUPER_ADMIN', 'CONTENT_ADMIN'),
  (req, res, next) => backupController.checkMediaHealth(req, res, next)
);
router.put(
  '/backups/config',
  requireRoles('SUPER_ADMIN'),
  (req, res, next) => backupController.updateConfig(req, res, next)
);

export default router;
