// Analytics Interface for Mwancha Senior Community
// Ready for Google Analytics 4, Plausible, or custom privacy-friendly tracking

interface AnalyticsEventParams {
  category?: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
}

class AnalyticsService {
  private initialized: boolean = false;
  private trackingId: string | undefined;

  constructor() {
    this.trackingId = import.meta.env.VITE_GA_TRACKING_ID;
    if (this.trackingId) {
      this.init();
    }
  }

  private init(): void {
    // Only initialize when valid tracking ID is supplied in production environment
    if (typeof window !== 'undefined' && this.trackingId) {
      this.initialized = true;
      // Hook for gtag or approved platform
    }
  }

  public trackPageView(path: string, title?: string): void {
    if (!this.initialized) return;
    // Log or forward to provider if configured
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'page_view', {
        page_path: path,
        page_title: title || document.title,
      });
    }
  }

  public trackEvent(action: string, params?: AnalyticsEventParams): void {
    if (!this.initialized) return;
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', action, params);
    }
  }
}

export const analytics = new AnalyticsService();
