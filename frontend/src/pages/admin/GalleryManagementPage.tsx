import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { galleryService, AlbumItem, MediaStats } from '../../services/galleryService';
import { GalleryItem, ContentStatus } from '../../types';
import {
  Upload,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle,
  Send,
  Globe,
  X,
  FolderPlus,
  RefreshCw,
  ShieldCheck,
  Camera,
  Grid,
  List,
  ExternalLink
} from 'lucide-react';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  IN_REVIEW: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
  CHANGES_REQUESTED: { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300' },
  APPROVED: { bg: 'bg-sky-100', text: 'text-sky-900', border: 'border-sky-300' },
  PUBLISHED: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300' },
  ARCHIVED: { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-300' }
};

export const GalleryManagementPage: React.FC = () => {
  const { hasPermission } = useAuth();

  const canUpload = hasPermission('MEDIA_MANAGE');
  const canDelete = hasPermission('MEDIA_MANAGE');
  const canApprove = hasPermission('CONTENT_APPROVE');
  const canPublish = hasPermission('CONTENT_PUBLISH');

  // State
  const [mediaList, setMediaList] = useState<GalleryItem[]>([]);
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [stats, setStats] = useState<MediaStats>({
    total: 0,
    published: 0,
    draft: 0,
    inReview: 0,
    approved: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAlbum, setSelectedAlbum] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadAltText, setUploadAltText] = useState<string>('');
  const [uploadCaption, setUploadCaption] = useState<string>('');
  const [uploadAlbumName, setUploadAlbumName] = useState<string>('Community Outreach');
  const [uploadPhotographer, setUploadPhotographer] = useState<string>('MSC Secretariat');
  const [consentConfirmed, setConsentConfirmed] = useState<boolean>(true);

  // New Album Modal State
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState<boolean>(false);
  const [newAlbumName, setNewAlbumName] = useState<string>('');
  const [newAlbumDesc, setNewAlbumDesc] = useState<string>('');

  // Preview / Lightbox Modal State
  const [previewMedia, setPreviewMedia] = useState<GalleryItem | null>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [mediaRes, albumsRes, statsRes] = await Promise.all([
        galleryService.getAdminMedia({
          page: currentPage,
          limit: 18,
          status: statusFilter
        }),
        galleryService.getAlbums(),
        galleryService.getMediaStats()
      ]);

      setMediaList(mediaRes.items);
      setTotalPages(mediaRes.totalPages);
      setAlbums(albumsRes);
      setStats(statsRes);
    } catch {
      showNotification('error', 'Failed to load media assets.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' '));
      }
      if (!uploadAltText) {
        setUploadAltText('Community outreach photo in Nyamira County');
      }
    }
  };

  // Upload handler
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showNotification('error', 'Please select an image file to upload.');
      return;
    }
    if (!consentConfirmed) {
      showNotification('error', 'Ethical safeguarding requires confirming consent for all depicted persons.');
      return;
    }

    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadTitle);
      formData.append('altText', uploadAltText || uploadTitle);
      formData.append('caption', uploadCaption);
      formData.append('albumName', uploadAlbumName);
      formData.append('photographer', uploadPhotographer);
      formData.append('consentConfirmed', 'true');

      await galleryService.uploadMedia(formData);
      showNotification('success', 'Image uploaded successfully in DRAFT state.');
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setFilePreview(null);
      setUploadTitle('');
      setUploadCaption('');
      loadData();
    } catch {
      showNotification('error', 'Upload failed. Check file size and network connection.');
    } finally {
      setActionLoading(false);
    }
  };

  // Album creation
  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;
    try {
      setActionLoading(true);
      await galleryService.createAlbum(newAlbumName, newAlbumDesc);
      showNotification('success', `Album "${newAlbumName}" created.`);
      setIsAlbumModalOpen(false);
      setNewAlbumName('');
      setNewAlbumDesc('');
      loadData();
    } catch {
      showNotification('error', 'Could not create album.');
    } finally {
      setActionLoading(false);
    }
  };

  // Workflow actions
  const handleSubmitReview = async (id: string) => {
    try {
      setActionLoading(true);
      await galleryService.submitReview(id);
      showNotification('success', 'Media submitted for review.');
      loadData();
    } catch {
      showNotification('error', 'Could not submit for review.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(true);
      await galleryService.approveMedia(id);
      showNotification('success', 'Media approved.');
      loadData();
    } catch {
      showNotification('error', 'Failed to approve media.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      setActionLoading(true);
      await galleryService.publishMedia(id);
      showNotification('success', 'Media published to public gallery.');
      loadData();
    } catch {
      showNotification('error', 'Only APPROVED media can be published.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this media item?')) return;
    try {
      setActionLoading(true);
      await galleryService.deleteMedia(id);
      showNotification('success', 'Media asset removed.');
      loadData();
    } catch {
      showNotification('error', 'Failed to delete media.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered media
  const filteredMedia = mediaList.filter((m) => {
    const matchesAlbum = selectedAlbum === 'All' || m.category === selectedAlbum || m.album?.name === selectedAlbum;
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.caption && m.caption.toLowerCase().includes(search.toLowerCase())) ||
      (m.altText && m.altText.toLowerCase().includes(search.toLowerCase()));
    return matchesAlbum && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          role="alert"
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-warm-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-forest-100 text-forest-800">
              <Camera className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-charcoal-900 font-display">Media & Gallery Manager</h1>
          </div>
          <p className="text-sm text-charcoal-600 mt-1">
            Curate verified photo archives, elder safeguarding consent records, thematic albums, and field outreach assets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-warm-300 bg-white text-charcoal-700 hover:bg-warm-50 text-sm font-semibold transition-colors disabled:opacity-50"
            title="Refresh assets"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {canUpload && (
            <>
              <button
                onClick={() => setIsAlbumModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-forest-300 bg-forest-50 text-forest-800 hover:bg-forest-100 text-sm font-bold transition-colors"
              >
                <FolderPlus className="w-4 h-4" />
                <span>New Album</span>
              </button>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-800 text-warm-50 hover:bg-forest-900 text-sm font-bold shadow-sm transition-all hover:scale-[1.01]"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Media</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-warm-200 shadow-sm">
          <span className="text-xs text-charcoal-500 font-semibold block uppercase">Total Photos</span>
          <span className="text-2xl font-extrabold text-charcoal-900 mt-1 block">{stats.total}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-warm-200 shadow-sm">
          <span className="text-xs text-emerald-700 font-semibold block uppercase">Published</span>
          <span className="text-2xl font-extrabold text-emerald-800 mt-1 block">{stats.published}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-warm-200 shadow-sm">
          <span className="text-xs text-amber-700 font-semibold block uppercase">In Review</span>
          <span className="text-2xl font-extrabold text-amber-800 mt-1 block">{stats.inReview}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-warm-200 shadow-sm">
          <span className="text-xs text-sky-700 font-semibold block uppercase">Approved</span>
          <span className="text-2xl font-extrabold text-sky-800 mt-1 block">{stats.approved}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-warm-200 shadow-sm">
          <span className="text-xs text-forest-700 font-semibold block uppercase">Albums</span>
          <span className="text-2xl font-extrabold text-forest-800 mt-1 block">{albums.length}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-warm-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search title, caption, alt text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-warm-50/50"
          />
        </div>

        {/* Filters & View Toggle */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Album Selector */}
          <div className="flex items-center gap-1.5 text-xs text-charcoal-600">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedAlbum}
              onChange={(e) => setSelectedAlbum(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-warm-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
            >
              <option value="All">All Albums</option>
              {albums.map((alb) => (
                <option key={alb.id} value={alb.name}>
                  {alb.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-warm-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
          >
            <option value="all">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="APPROVED">Approved</option>
            <option value="PUBLISHED">Published</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center rounded-xl border border-warm-200 overflow-hidden bg-warm-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-forest-800 text-white' : 'text-charcoal-600 hover:bg-warm-100'}`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-forest-800 text-white' : 'text-charcoal-600 hover:bg-warm-100'}`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Media Content View */}
      {loading ? (
        <div className="p-16 text-center text-charcoal-500 bg-white rounded-2xl border border-warm-200">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-forest-700 mb-3" />
          <p className="font-semibold text-sm">Loading media gallery...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="p-16 text-center text-charcoal-500 bg-white rounded-2xl border border-warm-200">
          <Camera className="w-10 h-10 text-warm-400 mx-auto mb-3" />
          <p className="font-bold text-charcoal-900">No media assets found.</p>
          <p className="text-xs text-charcoal-500 mt-1">Adjust filters or upload a new photo.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((media) => {
            const statusConfig = STATUS_COLORS[media.status || 'PUBLISHED'] || STATUS_COLORS.PUBLISHED;
            return (
              <div
                key={media.id}
                className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[4/3] bg-forest-950 overflow-hidden">
                  <img
                    src={media.imageUrl}
                    alt={media.altText || media.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/mwancha-facility-main.jpg';
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                    >
                      {media.status || 'PUBLISHED'}
                    </span>
                  </div>

                  <button
                    onClick={() => setPreviewMedia(media)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                    title="View details"
                  >
                    <Eye className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded-md border border-forest-200 inline-block mb-1.5">
                      {media.category}
                    </span>
                    <h3 className="font-bold text-charcoal-900 text-sm line-clamp-1">{media.title}</h3>
                    {media.caption && (
                      <p className="text-xs text-charcoal-500 line-clamp-2 mt-1">{media.caption}</p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-warm-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] text-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-semibold">Consented</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {media.status === 'DRAFT' && (
                        <button
                          onClick={() => handleSubmitReview(media.id)}
                          className="p-1 rounded text-amber-700 hover:bg-amber-50"
                          title="Submit for review"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canApprove && (media.status === 'IN_REVIEW' || media.status === 'DRAFT') && (
                        <button
                          onClick={() => handleApprove(media.id)}
                          className="p-1 rounded text-sky-700 hover:bg-sky-50"
                          title="Approve"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canPublish && media.status === 'APPROVED' && (
                        <button
                          onClick={() => handlePublish(media.id)}
                          className="p-1 rounded text-emerald-700 hover:bg-emerald-50"
                          title="Publish"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => handleDelete(media.id)}
                          className="p-1 rounded text-rose-700 hover:bg-rose-50"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-charcoal-700">
            <thead className="bg-warm-100/70 border-b border-warm-200 text-xs text-charcoal-600 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Preview</th>
                <th className="py-3 px-4">Title & Alt Text</th>
                <th className="py-3 px-4">Album</th>
                <th className="py-3 px-4">Safeguarding</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {filteredMedia.map((media) => {
                const statusConfig = STATUS_COLORS[media.status || 'PUBLISHED'] || STATUS_COLORS.PUBLISHED;
                return (
                  <tr key={media.id} className="hover:bg-warm-50/60">
                    <td className="py-2.5 px-4 w-16">
                      <div className="w-12 h-10 rounded-lg overflow-hidden bg-forest-950">
                        <img
                          src={media.imageUrl}
                          alt={media.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/mwancha-facility-main.jpg';
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-4 max-w-xs">
                      <div className="font-bold text-charcoal-900 truncate">{media.title}</div>
                      <div className="text-xs text-charcoal-400 truncate">{media.altText || media.caption}</div>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-xs font-semibold text-forest-800">
                      {media.category}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-800 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Confirmed
                      </span>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                      >
                        {media.status || 'PUBLISHED'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setPreviewMedia(media)}
                          className="p-1 rounded text-charcoal-600 hover:bg-warm-100"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(media.id)}
                            className="p-1 rounded text-rose-700 hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-warm-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-warm-100 text-charcoal-500"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <span className="p-2 rounded-xl bg-forest-100 text-forest-800">
                <Upload className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-charcoal-900 font-display">Upload Media Record</h2>
                <p className="text-xs text-charcoal-500">
                  Nonprofit safeguarding guidelines apply to all community photographs.
                </p>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* File Input */}
              <div className="border-2 border-dashed border-warm-300 rounded-2xl p-6 text-center hover:border-forest-600 transition-colors bg-warm-50/50">
                {filePreview ? (
                  <div className="space-y-3">
                    <img
                      src={filePreview}
                      alt="Upload preview"
                      className="max-h-48 mx-auto rounded-xl object-contain shadow-sm border border-warm-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreview(null);
                      }}
                      className="text-xs font-bold text-rose-700 hover:underline"
                    >
                      Remove and choose different image
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-forest-700 mx-auto mb-2" />
                    <label className="cursor-pointer font-bold text-sm text-forest-800 hover:text-forest-950 block">
                      Choose an image file
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-charcoal-400 mt-1">JPEG, PNG, WebP up to 10MB</p>
                  </div>
                )}
              </div>

              {/* Title & Alt Text */}
              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Traditional Gazebo & Assembly Pavilion"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">
                  Accessible Alt Text * (WCAG Compliance)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Describe the visual scene for screen-readers..."
                  value={uploadAltText}
                  onChange={(e) => setUploadAltText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              {/* Album & Photographer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">Album *</label>
                  <select
                    value={uploadAlbumName}
                    onChange={(e) => setUploadAlbumName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
                  >
                    {albums.map((a) => (
                      <option key={a.id} value={a.name}>
                        {a.name}
                      </option>
                    ))}
                    <option value="Community Outreach">Community Outreach</option>
                    <option value="Psychosocial Sessions">Psychosocial Sessions</option>
                    <option value="Advocacy">Advocacy</option>
                    <option value="Sensitization">Sensitization</option>
                    <option value="Home Visits">Home Visits</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">Photographer Credit</label>
                  <input
                    type="text"
                    value={uploadPhotographer}
                    onChange={(e) => setUploadPhotographer(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">Caption / Field Context</label>
                <textarea
                  rows={2}
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="Additional context on the activity, beneficiaries, or ward location..."
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              {/* Safeguarding Consent Checkbox */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="consentCheckbox"
                  checked={consentConfirmed}
                  onChange={(e) => setConsentConfirmed(e.target.checked)}
                  className="rounded text-forest-800 focus:ring-forest-600 mt-0.5"
                />
                <label htmlFor="consentCheckbox" className="text-xs text-emerald-950 font-medium cursor-pointer">
                  <span className="font-bold block">Elder & Vulnerable Adult Consent Confirmed</span>
                  I verify that all individuals depicted in this image have provided informed consent and no sensitive, undignified, or exploitative depictions are included.
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-warm-200">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-warm-300 text-charcoal-700 font-bold text-sm hover:bg-warm-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !selectedFile}
                  className="px-5 py-2 rounded-xl bg-forest-800 text-warm-50 font-bold text-sm hover:bg-forest-900 disabled:opacity-50"
                >
                  {actionLoading ? 'Uploading...' : 'Save Media'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Album Modal */}
      {isAlbumModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-warm-200">
            <h2 className="text-xl font-extrabold text-charcoal-900 font-display mb-1">Create Thematic Album</h2>
            <p className="text-xs text-charcoal-500 mb-4">Group media records into organized public collections.</p>

            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">Album Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Geriatric Health Camps 2025"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Purpose of this album..."
                  value={newAlbumDesc}
                  onChange={(e) => setNewAlbumDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAlbumModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-warm-300 text-xs font-bold text-charcoal-700 hover:bg-warm-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-forest-800 text-warm-50 text-xs font-bold hover:bg-forest-900 disabled:opacity-50"
                >
                  Create Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Preview Modal */}
      {previewMedia && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-warm-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-warm-100 hover:bg-warm-200 text-charcoal-700"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden bg-forest-950 max-h-96 flex items-center justify-center">
                <img
                  src={previewMedia.imageUrl}
                  alt={previewMedia.altText || previewMedia.title}
                  className="max-h-96 w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/mwancha-facility-main.jpg';
                  }}
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-forest-800 bg-forest-50 px-2.5 py-0.5 rounded-md border border-forest-200">
                    {previewMedia.category}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[previewMedia.status || 'PUBLISHED']?.bg} ${STATUS_COLORS[previewMedia.status || 'PUBLISHED']?.text} ${STATUS_COLORS[previewMedia.status || 'PUBLISHED']?.border}`}
                  >
                    {previewMedia.status || 'PUBLISHED'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-charcoal-900 font-display">{previewMedia.title}</h3>
                {previewMedia.caption && (
                  <p className="text-sm text-charcoal-600 mt-1 leading-relaxed">{previewMedia.caption}</p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-warm-50 border border-warm-200 text-xs space-y-1 text-charcoal-700">
                <div>
                  <strong>Alt Text:</strong> {previewMedia.altText || 'Not specified'}
                </div>
                <div>
                  <strong>Location:</strong> {previewMedia.location || 'Kebirigo, Nyamira County'}
                </div>
                <div>
                  <strong>Safeguarding Consent:</strong> {previewMedia.consentConfirmed ? 'Verified & On File' : 'Pending'}
                </div>
              </div>

              <div className="pt-3 border-t border-warm-200 flex items-center justify-between">
                <a
                  href="/gallery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-950"
                >
                  <span>View in Public Gallery</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
