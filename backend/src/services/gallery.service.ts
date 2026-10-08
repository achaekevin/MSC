import { prisma } from '../config/database.js';
import { NotFoundError, BadRequestError } from '../errors/AppError.js';
import { ContentStatus, ContentSource } from '@prisma/client';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

export class GalleryService {
  async getPublicGallery(category?: string, page = 1, limit = 12) {
    const skip = (page - 1) * limit;
    const where: any = {
      status: { in: [ContentStatus.APPROVED, ContentStatus.PUBLISHED] },
      consentConfirmed: true, // Crucial elder & child safeguarding rule
      deletedAt: null
    };

    if (category && category !== 'All') {
      where.album = {
        name: category
      };
    }

    const [total, items] = await Promise.all([
      prisma.media.count({ where }),
      prisma.media.findMany({
        where,
        skip,
        take: limit,
        include: { album: true },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      items: items.map(m => ({
        id: m.id,
        title: m.title || m.altText || 'Mwancha Community Facility',
        caption: m.caption || m.altText,
        category: m.album?.name || 'Community Outreach',
        imageUrl: m.secureUrl,
        date: m.createdAt.toISOString().split('T')[0],
        location: 'Nyamira County, Kenya'
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getPublicAlbums() {
    return prisma.galleryAlbum.findMany({
      where: { status: { in: [ContentStatus.APPROVED, ContentStatus.PUBLISHED] } },
      include: {
        _count: {
          select: { mediaItems: { where: { status: { in: [ContentStatus.APPROVED, ContentStatus.PUBLISHED] }, consentConfirmed: true, deletedAt: null } } }
        }
      }
    });
  }

  async getAdminMedia(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (status && status !== 'all') {
      where.status = status as ContentStatus;
    }

    const [total, items] = await Promise.all([
      prisma.media.count({ where }),
      prisma.media.findMany({
        where,
        skip,
        take: limit,
        include: { album: true },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async uploadMedia(file: Express.Multer.File, data: any, userId?: string) {
    if (!file || !file.buffer) {
      throw new BadRequestError('Image file is required');
    }

    const uploadRes = await uploadToCloudinary(file.buffer, 'msc_gallery', file.originalname);

    let albumId = data.albumId;
    if (data.albumName && !albumId) {
      let album = await prisma.galleryAlbum.findFirst({ where: { name: data.albumName } });
      if (!album) {
        album = await prisma.galleryAlbum.create({
          data: {
            name: data.albumName,
            slug: data.albumName.toLowerCase().replace(/\s+/g, '-'),
            status: ContentStatus.APPROVED
          }
        });
      }
      albumId = album.id;
    }

    const media = await prisma.media.create({
      data: {
        publicId: uploadRes.publicId,
        url: uploadRes.secureUrl,
        fileName: file?.originalname || 'upload.jpg',
        fileSize: uploadRes.bytes || 0,
        title: data.title || file?.originalname,
        caption: data.caption,
        description: data.description,
        albumId,
        cloudinaryPublicId: uploadRes.publicId,
        secureUrl: uploadRes.secureUrl,
        format: uploadRes.format,
        bytes: uploadRes.bytes,
        width: uploadRes.width,
        height: uploadRes.height,
        altText: data.altText || data.title || 'Mwancha Senior Community outreach photograph',
        consentConfirmed: data.consentConfirmed !== undefined ? (data.consentConfirmed === 'true' || data.consentConfirmed === true) : true,
        status: (data.status as ContentStatus) || ContentStatus.APPROVED,
        source: (data.source as ContentSource) || ContentSource.CLIENT,
        approvalRequired: false
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPLOAD_MEDIA',
        entity: 'Media',
        entityId: media.id,
        newData: JSON.stringify({ publicId: uploadRes.publicId, url: uploadRes.secureUrl })
      }
    });

    return media;
  }

  async deleteMedia(id: string, userId?: string) {
    const existing = await prisma.media.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Media record not found');

    if (existing.cloudinaryPublicId) {
      await deleteFromCloudinary(existing.cloudinaryPublicId);
    }

    await prisma.media.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        entity: 'Media',
        entityId: id
      }
    });

    return true;
  }

  async approveMedia(id: string, reviewerId?: string) {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundError('Media record not found');

    return prisma.media.update({
      where: { id },
      data: {
        status: ContentStatus.APPROVED,
        publishedAt: new Date()
      }
    });
  }

  async publishMedia(id: string, publisherId?: string) {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundError('Media record not found');

    if (media.status !== ContentStatus.APPROVED) {
      throw new BadRequestError('Only APPROVED media records can transition to PUBLISHED.');
    }

    return prisma.media.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date()
      }
    });
  }

  async submitReview(id: string, notes?: string, submitterId?: string) {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media || media.deletedAt) throw new NotFoundError('Media record not found');

    return prisma.media.update({
      where: { id },
      data: {
        status: ContentStatus.IN_REVIEW
      }
    });
  }

  async updateMedia(id: string, data: any, userId?: string) {
    const existing = await prisma.media.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError('Media record not found');

    const updated = await prisma.media.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : existing.title,
        caption: data.caption !== undefined ? data.caption : existing.caption,
        description: data.description !== undefined ? data.description : existing.description,
        altText: data.altText !== undefined ? data.altText : existing.altText,
        photographer: data.photographer !== undefined ? data.photographer : existing.photographer,
        albumId: data.albumId !== undefined ? data.albumId : existing.albumId,
        consentConfirmed: data.consentConfirmed !== undefined ? Boolean(data.consentConfirmed) : existing.consentConfirmed
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        entity: 'Media',
        entityId: id,
        newData: JSON.stringify(data)
      }
    });

    return updated;
  }

  async createAlbum(name: string, description?: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const album = await prisma.galleryAlbum.create({
      data: {
        name,
        slug,
        description,
        status: ContentStatus.APPROVED
      }
    });
    return album;
  }
}

export const galleryService = new GalleryService();
