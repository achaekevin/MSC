const isLoopbackHost = (hostname: string): boolean => {
  const normalizedHostname = hostname.toLowerCase();
  return normalizedHostname === 'localhost' ||
    normalizedHostname === '127.0.0.1' ||
    normalizedHostname === '[::1]' ||
    normalizedHostname === '::1';
};

const isLoopbackUrl = (url: string): boolean => {
  try {
    const baseUrl = typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
    return isLoopbackHost(new URL(url, baseUrl).hostname);
  } catch {
    return false;
  }
};

export const getApiBaseUrl = (): string => {
  const configuredUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (configuredUrl && !(import.meta.env.PROD && isLoopbackUrl(configuredUrl))) {
    return configuredUrl;
  }

  if (typeof window !== 'undefined' && !isLoopbackHost(window.location.hostname)) {
    return '/api/v1';
  }

  return 'http://localhost:5000/api/v1';
};
