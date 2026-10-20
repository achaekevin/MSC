import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { publicationService, PublicationItem } from '../../services/publicationService';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Button } from '../../components/ui/Button';
import { SEO } from '../../components/common/SEO';
import { MpesaCheckoutModal } from '../../components/commerce/MpesaCheckoutModal';
import {
  BookOpen,
  Download,
  Printer,
  ArrowLeft,
  Share2,
  Clock,
  Calendar,
  User,
  Check,
  Copy,
  Layers,
  Sparkles,
  ShieldCheck,
  FileText,
  Bookmark,
  Sun,
  Moon,
  Coffee,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Lock,
  CreditCard,
  KeyRound,
  ShoppingBag,
  Mail
} from 'lucide-react';
import { MSC_ORGANIZATION } from '../../constants';
import { downloadPublicationPdf } from '../../utils/pdfGenerator';

type ReaderTheme = 'light' | 'sepia' | 'dark';
type FontSize = 'sm' | 'md' | 'lg' | 'xl';

export const PublicationReaderPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [publication, setPublication] = useState<PublicationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Commerce & Entitlement states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState(() => localStorage.getItem('msc_customer_email') || '');
  const [verifyEmailInput, setVerifyEmailInput] = useState('');
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState(false);

  // Reader Customization States
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>('light');
  const [fontSize, setFontSize] = useState<FontSize>('md');
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch publication
  const fetchDoc = React.useCallback(async (email?: string) => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const activeEmail = email || customerEmail;
      const data = await publicationService.getPublicPublicationBySlug(slug, activeEmail || undefined);
      setPublication(data);
    } catch (err: any) {
      setError(err?.message || 'Publication not found.');
    } finally {
      setLoading(false);
    }
  }, [slug, customerEmail]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  // Handle restoring purchase via email
  const handleVerifyPurchaserEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyEmailInput.trim() || !verifyEmailInput.includes('@')) {
      setVerifyError('Please enter a valid email address.');
      return;
    }

    setVerifyingEmail(true);
    setVerifyError(null);
    setVerifySuccess(false);

    try {
      const email = verifyEmailInput.trim().toLowerCase();
      const updatedDoc = await publicationService.getPublicPublicationBySlug(slug!, email);
      if (updatedDoc.isEntitled) {
        setPublication(updatedDoc);
        setCustomerEmail(email);
        localStorage.setItem('msc_customer_email', email);
        setVerifySuccess(true);
      } else {
        setVerifyError('No active purchase record found for this email. Please check the spelling or proceed to unlock.');
      }
    } catch (err: any) {
      setVerifyError(err?.message || 'Failed to verify purchase.');
    } finally {
      setVerifyingEmail(false);
    }
  };

  // Monitor scroll for reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle direct PDF generation and download
  const handleExportPDF = () => {
    if (!publication) return;

    if (publication.isPaid && !publication.isEntitled) {
      setIsCheckoutOpen(true);
      return;
    }

    setDownloading(true);
    try {
      if (publication.hasPrivatePdf) {
        const downloadUrl = publicationService.getDownloadUrl(publication.id, undefined, customerEmail || undefined);
        window.open(downloadUrl, '_blank');
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      } else {
        downloadPublicationPdf(publication);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Client-side PDF generation fallback:', err);
      if (publication.pdfUrl) {
        window.open(publication.pdfUrl, '_blank');
      } else {
        const originalTitle = document.title;
        document.title = publication.title;
        window.print();
        setTimeout(() => { document.title = originalTitle; }, 500);
      }
    } finally {
      setDownloading(false);
    }
  };


  // Copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Theme style classes
  const getThemeClasses = () => {
    switch (readerTheme) {
      case 'sepia':
        return 'bg-[#fbf0d9] text-[#433422] border-[#ecdcc0]';
      case 'dark':
        return 'bg-charcoal-950 text-warm-100 border-charcoal-800';
      case 'light':
      default:
        return 'bg-white text-charcoal-900 border-warm-200';
    }
  };

  // Font size classes
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-base leading-relaxed';
      case 'lg':
        return 'text-xl leading-relaxed';
      case 'xl':
        return 'text-2xl leading-loose';
      case 'md':
      default:
        return 'text-lg leading-relaxed';
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center">
        <div className="w-12 h-12 border-4 border-forest-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-bold text-charcoal-800 dark:text-warm-100 font-display">
          Preparing Publication Reader...
        </h2>
        <p className="text-sm text-charcoal-500 mt-1">Formatting text and chapters for reading.</p>
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="py-24 text-center">
        <Container>
          <div className="max-w-md mx-auto bg-white dark:bg-charcoal-900 p-8 rounded-3xl border border-warm-200 dark:border-charcoal-800 shadow-card">
            <BookOpen className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-charcoal-900 dark:text-white font-display">
              Document Not Found
            </h2>
            <p className="text-sm text-charcoal-600 dark:text-warm-300 mt-2">
              {error || 'This publication or book could not be loaded.'}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button to="/publications" variant="primary" size="sm">
                Return to Publications Library
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  const isLocked = Boolean(publication.isPaid && !publication.isEntitled);

  return (
    <div className="pb-24 text-left relative">
      <SEO
        title={`${publication.title} | Mwancha Senior Community`}
        description={publication.summary}
      />

      {/* Reading Progress Top Bar (Fixed) */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-warm-200/50 z-50 pointer-events-none print:hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-forest-800 transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Reader Control Header Bar (Sticky) */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-charcoal-900/95 backdrop-blur-md border-b border-warm-200 dark:border-charcoal-800 py-3 px-4 sm:px-8 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/publications"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-warm-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-warm-200 hover:bg-warm-200 text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Library</span>
            </Link>

            <span className="hidden sm:inline-block text-xs font-bold text-charcoal-400">|</span>
            <span className="hidden sm:inline-block text-xs font-bold text-charcoal-800 dark:text-warm-200 truncate max-w-xs md:max-w-md">
              {publication.title}
            </span>

            {isLocked && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500 text-charcoal-950">
                <Lock className="w-3 h-3" />
                KES {publication.price?.toLocaleString()}
              </span>
            )}
          </div>

          {/* Reader Appearance & Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Selector */}
            <div className="flex items-center bg-warm-100 dark:bg-charcoal-800 rounded-xl p-1 border border-warm-200 dark:border-charcoal-700 text-xs">
              <button
                onClick={() => setReaderTheme('light')}
                className={`p-1.5 rounded-lg transition-colors ${
                  readerTheme === 'light' ? 'bg-white shadow-xs text-charcoal-950 font-bold' : 'text-charcoal-600 dark:text-warm-300'
                }`}
                title="Light Theme"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setReaderTheme('sepia')}
                className={`p-1.5 rounded-lg transition-colors ${
                  readerTheme === 'sepia' ? 'bg-[#fbf0d9] text-[#433422] shadow-xs font-bold' : 'text-charcoal-600 dark:text-warm-300'
                }`}
                title="Warm Sepia Book Theme"
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setReaderTheme('dark')}
                className={`p-1.5 rounded-lg transition-colors ${
                  readerTheme === 'dark' ? 'bg-charcoal-900 text-white shadow-xs font-bold' : 'text-charcoal-600 dark:text-warm-300'
                }`}
                title="Dark Theme"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Font Size Adjuster */}
            <div className="hidden sm:flex items-center bg-warm-100 dark:bg-charcoal-800 rounded-xl p-1 border border-warm-200 dark:border-charcoal-700 text-xs">
              <button
                onClick={() => setFontSize(fontSize === 'xl' ? 'lg' : fontSize === 'lg' ? 'md' : 'sm')}
                className="p-1.5 rounded-lg text-charcoal-600 dark:text-warm-300 hover:text-charcoal-950"
                title="Decrease Font Size"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 text-[11px] font-black uppercase text-charcoal-500">
                {fontSize}
              </span>
              <button
                onClick={() => setFontSize(fontSize === 'sm' ? 'md' : fontSize === 'md' ? 'lg' : 'xl')}
                className="p-1.5 rounded-lg text-charcoal-600 dark:text-warm-300 hover:text-charcoal-950"
                title="Increase Font Size"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Share / Copy Button */}
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-warm-100 dark:bg-charcoal-800 hover:bg-warm-200 dark:hover:bg-charcoal-700 text-charcoal-700 dark:text-warm-200 transition-colors text-xs font-bold flex items-center gap-1 border border-warm-200 dark:border-charcoal-700"
              title="Share Link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{copied ? 'Copied' : 'Share'}</span>
            </button>

            {/* Open Original PDF Tab if Free or Entitled */}
            {!isLocked && publication?.pdfUrl && (
              <a
                href={publication.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 hover:bg-warm-100 dark:hover:bg-charcoal-700 text-charcoal-800 dark:text-warm-100 font-bold text-xs transition-colors"
                title="View PDF directly in browser"
              >
                <ExternalLink className="w-3.5 h-3.5 text-forest-800 dark:text-emerald-400" />
                <span>View PDF</span>
              </a>
            )}

            {/* Export / Unlock Action Button */}
            {isLocked ? (
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-black text-xs shadow-md transition-all active:scale-95"
                title="Unlock publication via Lipa Na M-Pesa"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Unlock (KES {publication.price})</span>
              </button>
            ) : (
              <button
                onClick={handleExportPDF}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-forest-900 dark:bg-emerald-600 hover:bg-forest-800 dark:hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                title="Export as formatted PDF document"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Downloaded!</span>
                  </>
                ) : downloading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Export as PDF</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Document Reading Area */}
      <Container className="pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Chapter Table of Contents Sidebar (Sticky) */}
          <div className="lg:col-span-4 sticky top-20 space-y-6 print:hidden">
            <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 border border-warm-200 dark:border-charcoal-800 shadow-sm space-y-4">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-warm-100 relative">
                <img
                  src={publication.coverImage || '/images/mwancha-facility-main.jpg'}
                  alt={publication.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-forest-950/90 text-amber-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-white/20">
                  {publication.category}
                </div>
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-wider text-forest-800 dark:text-emerald-400">
                  Table of Contents
                </span>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Select a section to jump directly:
                </p>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {publication.chapters && publication.chapters.length > 0 ? (
                  publication.chapters.map((ch, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveChapterIndex(idx);
                        const el = document.getElementById(`chapter-${idx}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                        activeChapterIndex === idx
                          ? 'bg-forest-50 text-forest-900 border border-forest-200 dark:bg-forest-900/60 dark:text-emerald-300 dark:border-forest-700'
                          : 'text-charcoal-700 hover:bg-warm-100 dark:text-warm-300 dark:hover:bg-charcoal-800'
                      }`}
                    >
                      <span className="truncate pr-2">{ch.title}</span>
                      <span className="text-[10px] opacity-60 flex-shrink-0">§{idx + 1}</span>
                    </button>
                  ))
                ) : (
                  <div className="text-xs text-charcoal-500 italic p-2">
                    Complete single narrative document.
                  </div>
                )}
              </div>

              {/* Document Metadata Summary Box */}
              <div className="pt-4 border-t border-warm-100 dark:border-charcoal-800 space-y-2 text-xs text-charcoal-600 dark:text-warm-300">
                <div className="flex justify-between">
                  <span className="font-semibold text-charcoal-400">Author:</span>
                  <span className="font-bold text-charcoal-800 dark:text-white truncate max-w-[160px]">{publication.authorName}</span>
                </div>
                {publication.pages && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-charcoal-400">Pages:</span>
                    <span className="font-bold">{publication.pages} Pages</span>
                  </div>
                )}
                {publication.isbn && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-charcoal-400">Reference:</span>
                    <span className="font-bold">{publication.isbn}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-semibold text-charcoal-400">Format:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Full Text & Printable PDF</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reader Document Body */}
          <div className="lg:col-span-8 space-y-8" ref={contentRef}>
            {/* The Book/Publication Container */}
            <article
              className={`rounded-3xl p-8 sm:p-14 border shadow-card transition-colors duration-200 ${getThemeClasses()} print:border-none print:shadow-none print:p-0`}
            >
              {/* PRINT-ONLY OFFICIAL LETTERHEAD HEADER */}
              <div className="hidden print:block pb-6 mb-8 border-b-2 border-forest-900 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-black text-forest-950 uppercase tracking-tight">
                      {MSC_ORGANIZATION.name}
                    </h1>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {MSC_ORGANIZATION.postalAddress} • {MSC_ORGANIZATION.county}, {MSC_ORGANIZATION.country}
                    </p>
                    <p className="text-xs text-gray-600">
                      Official Document & Institutional Publications Archive
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p className="font-bold text-gray-800">Published: {new Date(publication.publishedAt).toLocaleDateString('en-KE', { dateStyle: 'long' })}</p>
                    {publication.isbn && <p>{publication.isbn}</p>}
                  </div>
                </div>
              </div>

              {/* Title & Metadata Block */}
              <header className="pb-8 mb-8 border-b border-current/15 text-left">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-current/10">
                    {publication.category}
                  </span>
                  <span className="text-xs font-semibold opacity-70">
                    Published: {new Date(publication.publishedAt).toLocaleDateString('en-KE', { dateStyle: 'long' })}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight leading-tight">
                  {publication.title}
                </h1>

                {publication.subtitle && (
                  <p className="text-lg sm:text-xl font-medium mt-2 opacity-85 italic">
                    {publication.subtitle}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold opacity-80 pt-4 border-t border-current/10">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>Author: {publication.authorName} ({publication.authorRole})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>{publication.readingTime || '20 min read'}</span>
                  </span>
                  {publication.isbn && (
                    <span className="font-mono bg-current/5 px-2 py-0.5 rounded">
                      {publication.isbn}
                    </span>
                  )}
                </div>
              </header>

              {/* Executive Summary / Abstract */}
              <div className="my-8 p-6 rounded-2xl bg-current/5 border border-current/10 text-left">
                <h4 className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">
                  Executive Summary / Abstract
                </h4>
                <p className="text-base leading-relaxed italic opacity-95">
                  "{publication.summary}"
                </p>
              </div>

              {/* Chapters or Full Narrative Text vs Paywall Gating */}
              {isLocked ? (
                <div className="space-y-8 text-left">
                  {/* Preview Excerpt */}
                  {publication.previewExcerpt && (
                    <div className="p-6 rounded-2xl bg-warm-50 dark:bg-charcoal-800/80 border border-warm-200 dark:border-charcoal-700">
                      <span className="text-[11px] font-black uppercase tracking-wider text-forest-800 dark:text-emerald-400 block mb-2">
                        Preview Excerpt
                      </span>
                      <p className="text-base leading-relaxed italic opacity-95">
                        "{publication.previewExcerpt}"
                      </p>
                    </div>
                  )}

                  {/* High-conversion Paywall Card */}
                  <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-forest-950 via-forest-900 to-charcoal-950 text-white border-2 border-amber-500/50 shadow-2xl space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-800 pb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                          <Lock className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block">
                            Premium Institutional Resource
                          </span>
                          <h3 className="text-2xl font-black font-display text-white">
                            Unlock Full Publication
                          </h3>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs text-forest-200 block">One-time Investment</span>
                        <span className="text-3xl font-black text-amber-300 font-display">
                          KES {publication.price?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-forest-100/90 font-medium">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>Instant online reading of all {publication.pages || ''} pages & chapters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>Official high-res printable PDF download license</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>Automated Safaricom Lipa Na M-Pesa STK push</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>Digital tax receipt and download code sent to email</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-4">
                      <button
                        type="button"
                        onClick={() => setIsCheckoutOpen(true)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-black text-sm shadow-xl transition-all active:scale-95 cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Unlock Now via Lipa Na M-Pesa (KES {publication.price})</span>
                      </button>

                      <Link
                        to="/my-publications"
                        className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-forest-800/80 hover:bg-forest-700 text-amber-300 font-bold text-xs border border-forest-700 transition-all"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Customer Library</span>
                      </Link>
                    </div>

                    {/* Restore Purchase with Email */}
                    <div className="pt-6 border-t border-forest-800/80">
                      <h4 className="text-xs font-bold text-forest-200 mb-2 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        <span>Already purchased this publication?</span>
                      </h4>
                      <form onSubmit={handleVerifyPurchaserEmail} className="flex flex-col sm:flex-row gap-2 max-w-lg">
                        <input
                          type="email"
                          placeholder="Enter the email used during purchase..."
                          value={verifyEmailInput}
                          onChange={(e) => setVerifyEmailInput(e.target.value)}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-forest-900 border border-forest-700 text-white placeholder-forest-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="submit"
                          disabled={verifyingEmail}
                          className="px-4 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-600 text-white font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
                        >
                          {verifyingEmail ? 'Verifying...' : 'Restore Access'}
                        </button>
                      </form>
                      {verifyError && (
                        <p className="text-xs text-rose-300 font-medium mt-2">{verifyError}</p>
                      )}
                      {verifySuccess && (
                        <p className="text-xs text-emerald-300 font-medium mt-2">
                          Access verified! Your document has been unlocked.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`space-y-12 text-left font-serif ${getFontSizeClass()}`}>
                  {publication.chapters && publication.chapters.length > 0 ? (
                    publication.chapters.map((chapter, idx) => (
                      <section
                        key={idx}
                        id={`chapter-${idx}`}
                        className="space-y-4 pt-4 border-t border-current/10 first:border-t-0"
                      >
                        <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-forest-900 dark:text-emerald-400 print:text-black">
                          {chapter.title}
                        </h2>
                        <div className="whitespace-pre-line leading-relaxed opacity-90 text-justify">
                          {chapter.body}
                        </div>
                      </section>
                    ))
                  ) : (
                    <div className="whitespace-pre-line leading-relaxed opacity-90 text-justify">
                      {publication.content || publication.fullText}
                    </div>
                  )}
                </div>
              )}

              {/* Institutional Research & Legal Verification Callout */}
              <div className="mt-12 p-6 rounded-2xl bg-forest-50 dark:bg-charcoal-800/80 border border-forest-200 dark:border-charcoal-700 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-forest-900 dark:text-emerald-300">
                    Institutional Research & Statutory Verification
                  </h4>
                </div>
                <p className="text-xs text-charcoal-700 dark:text-warm-200 leading-relaxed">
                  This document serves as an official institutional publication and field manual of Mwancha Senior Community (MSC).
                  All statutory and policy authorities cited (including Article 57 of the Constitution of Kenya, the National Social Protection Policy, and county land registration safeguards) can be verified via the official Kenya Law Reports portal (<a href="http://kenyalaw.org" target="_blank" rel="noopener noreferrer" className="text-forest-800 dark:text-emerald-400 underline font-semibold">kenyalaw.org</a>) and the National Social Protection Secretariat (<a href="https://www.socialprotection.or.ke" target="_blank" rel="noopener noreferrer" className="text-forest-800 dark:text-emerald-400 underline font-semibold">socialprotection.or.ke</a>).
                </p>
              </div>

              {/* Official Document Footer (Printed) */}
              <footer className="mt-12 pt-8 border-t border-current/15 text-xs opacity-75 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-bold">Mwancha Senior Community (MSC)</p>
                  <p>© {new Date().getFullYear()} All rights reserved. Registered Community Organization in Kenya.</p>
                </div>
                <div className="text-right">
                  <p>Advancing Dignity, Care & Wellbeing for Older Persons</p>
                  <p className="font-mono">www.mwanchasenior.org</p>
                </div>
              </footer>
            </article>

            {/* Bottom Action Bar */}
            <div className="bg-forest-950 text-white rounded-3xl p-8 border border-forest-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden">
              <div className="text-left space-y-1">
                <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                  {isLocked ? (
                    <>
                      <Lock className="w-5 h-5 text-amber-400" />
                      <span>Unlock Complete Publication</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 text-emerald-400" />
                      <span>Download or Print for Field Work</span>
                    </>
                  )}
                </h3>
                <p className="text-xs text-forest-200">
                  {isLocked
                    ? `Unlock instant access via Lipa Na M-Pesa (KES ${publication.price}) for full online reading and official PDF download.`
                    : 'Export this complete publication as a high-resolution PDF for offline study or community training.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {isLocked ? (
                  <Button
                    onClick={() => setIsCheckoutOpen(true)}
                    variant="primary"
                    size="md"
                    className="bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-black border-none"
                    icon={<CreditCard className="w-4 h-4" />}
                  >
                    Unlock (KES {publication.price})
                  </Button>
                ) : (
                  <Button
                    onClick={handleExportPDF}
                    variant="primary"
                    size="md"
                    disabled={downloading}
                    icon={downloadSuccess ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  >
                    {downloadSuccess ? 'Downloaded!' : downloading ? 'Generating PDF...' : 'Download / Save as PDF'}
                  </Button>
                )}
                <Button
                  to="/publications"
                  variant="outline"
                  size="md"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  All Books
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Lipa Na M-Pesa Checkout Modal */}
      {isCheckoutOpen && (
        <MpesaCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          itemType="PUBLICATION"
          itemId={publication.id}
          itemTitle={publication.title}
          itemSubtitle={publication.subtitle}
          coverImage={publication.coverImage}
          amount={publication.price || 0}
          onSuccess={(res) => {
            setIsCheckoutOpen(false);
            if (res.customerEmail) {
              setCustomerEmail(res.customerEmail);
              localStorage.setItem('msc_customer_email', res.customerEmail);
              fetchDoc(res.customerEmail);
            } else {
              fetchDoc();
            }
          }}
        />
      )}
    </div>
  );
};

export default PublicationReaderPage;

