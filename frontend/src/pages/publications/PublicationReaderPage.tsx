import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { publicationService, PublicationItem } from '../../services/publicationService';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Button } from '../../components/ui/Button';
import { SEO } from '../../components/common/SEO';
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
  ZoomOut
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

  // Reader Customization States
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>('light');
  const [fontSize, setFontSize] = useState<FontSize>('md');
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch publication
  useEffect(() => {
    if (!slug) return;
    const fetchDoc = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await publicationService.getPublicPublicationBySlug(slug);
        setPublication(data);
      } catch (err: any) {
        setError(err?.message || 'Publication not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [slug]);

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

    try {
      downloadPublicationPdf(publication);
    } catch (err) {
      console.error('Client-side PDF generation fallback:', err);
      // Fallback to print
      window.print();
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

            {/* Export / Download as PDF Action Button */}
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-forest-900 dark:bg-emerald-600 hover:bg-forest-800 dark:hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              title="Export as formatted PDF or print"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export as PDF</span>
            </button>
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

              {/* Chapters or Full Narrative Text */}
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

              {/* Official Document Footer (Printed) */}
              <footer className="mt-16 pt-8 border-t border-current/15 text-xs opacity-75 flex flex-col sm:flex-row items-center justify-between gap-4">
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

            {/* Bottom Download & Sharing Bar */}
            <div className="bg-forest-950 text-white rounded-3xl p-8 border border-forest-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden">
              <div className="text-left space-y-1">
                <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-400" />
                  <span>Download or Print for Field Work</span>
                </h3>
                <p className="text-xs text-forest-200">
                  Export this complete publication as a high-resolution PDF for offline study or community training.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  onClick={handleExportPDF}
                  variant="primary"
                  size="md"
                  icon={<Download className="w-4 h-4" />}
                >
                  Download / Save as PDF
                </Button>
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
    </div>
  );
};

export default PublicationReaderPage;
