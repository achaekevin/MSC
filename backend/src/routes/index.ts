import { Router } from 'express';
import authRoutes from './auth.routes.js';
import organizationRoutes from './organization.routes.js';
import programRoutes from './program.routes.js';
import newsRoutes from './news.routes.js';
import eventRoutes from './event.routes.js';
import impactRoutes from './impact.routes.js';
import teamRoutes from './team.routes.js';
import galleryRoutes from './gallery.routes.js';
import formRoutes from './form.routes.js';
import donationRoutes from './donation.routes.js';
import searchRoutes from './search.routes.js';
import testimonialRoutes from './testimonial.routes.js';
import storyRoutes from './story.routes.js';
import publicationRoutes from './publication.routes.js';
import adminRoutes from './admin.routes.js';

const apiV1Router = Router();

apiV1Router.use('/auth', authRoutes);
apiV1Router.use('/organization', organizationRoutes);
apiV1Router.use('/programs', programRoutes);
apiV1Router.use('/news', newsRoutes);
apiV1Router.use('/events', eventRoutes);
apiV1Router.use('/impact', impactRoutes);
apiV1Router.use('/team', teamRoutes);
apiV1Router.use('/gallery', galleryRoutes);
apiV1Router.use('/testimonials', testimonialRoutes);
apiV1Router.use('/stories', storyRoutes);
apiV1Router.use('/publications', publicationRoutes);
apiV1Router.use('/donations', donationRoutes);
apiV1Router.use('/search', searchRoutes);
apiV1Router.use('/admin', adminRoutes);
apiV1Router.use('/', formRoutes); // mounts /contact, /volunteers/apply, /partnerships/apply

export default apiV1Router;
