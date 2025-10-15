/**
 * Analytics Integration Utility
 * Provides GDPR-compliant analytics tracking with opt-in/opt-out support
 */

import { useEffect, useCallback } from 'react';
import type { AnalyticsEvent } from '@/types';

// Analytics opt-in state (default: false for privacy)
const ANALYTICS_STORAGE_KEY = 'analytics_consent';
const isAnalyticsEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  const consent = localStorage.getItem(ANALYTICS_STORAGE_KEY);
  return consent === 'true';
};

// Set global analytics flag
if (typeof window !== 'undefined') {
  (window as any).__analyticsEnabled = isAnalyticsEnabled();
}

/**
 * Enable analytics tracking (requires user opt-in)
 */
export const enableAnalytics = (): void => {
  localStorage.setItem(ANALYTICS_STORAGE_KEY, 'true');
  (window as any).__analyticsEnabled = true;
  console.log('Analytics enabled');
};

/**
 * Disable analytics tracking
 */
export const disableAnalytics = (): void => {
  localStorage.setItem(ANALYTICS_STORAGE_KEY, 'false');
  (window as any).__analyticsEnabled = false;
  console.log('Analytics disabled');
};

/**
 * Check if user has opted in to analytics
 */
export const hasAnalyticsConsent = (): boolean => {
  return isAnalyticsEnabled();
};

/**
 * Standard event names for consistent tracking
 */
export const AnalyticsEvents = {
  PAGE_VIEW: 'page_view',
  CONTACT_SUBMIT: 'contact_submit',
  CONTACT_SUBMIT_SUCCESS: 'contact_submit_success',
  CALCULATOR_USE: 'calculator_use',
  CALCULATOR_SUBMIT: 'calculator_submit',
  TOKEN_REDEEM: 'token_redeem',
  POPUP_OPEN: 'popup_open',
  POPUP_CONVERT: 'popup_convert',
  BLOG_VIEW: 'blog_view',
  PORTFOLIO_VIEW: 'portfolio_view',
  SERVICE_VIEW: 'service_view',
  CTA_CLICK: 'cta_click',
  
  // New CTA and conversion events
  CTA_IMPRESSION: 'cta_impression',
  CTA_CONVERSION: 'cta_conversion',
  LEAD_CAPTURED: 'lead_captured',
  EXIT_INTENT_TRIGGERED: 'exit_intent_triggered',
  EXIT_INTENT_DISMISSED: 'exit_intent_dismissed',
  
  // SEO and engagement events
  INTERNAL_LINK_CLICK: 'internal_link_click',
  RELATED_POST_CLICK: 'related_post_click',
  BREADCRUMB_CLICK: 'breadcrumb_click',
  SEARCH_PERFORMED: 'search_performed',
  
  // Funnel events
  PRICING_ESTIMATE_GENERATED: 'pricing_estimate_generated',
  QUOTE_REQUESTED: 'quote_requested',
  PROJECT_INQUIRY: 'project_inquiry',
} as const;

/**
 * Track analytics event (gated by opt-in consent)
 */
export const trackEvent = (event: AnalyticsEvent): void => {
  if (!isAnalyticsEnabled()) {
    console.log('[Analytics] Event blocked (no consent):', event.name);
    return;
  }

  const eventData = {
    ...event,
    timestamp: event.timestamp || Date.now(),
  };

  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event.name, event.properties);
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', event.name, event.properties);
  }

  // Console log for development
  if (import.meta.env.DEV) {
    console.log('[Analytics]', eventData);
  }
};

/**
 * Track page view
 */
export const trackPageView = (path: string, title?: string): void => {
  trackEvent({
    name: AnalyticsEvents.PAGE_VIEW,
    properties: {
      page_path: path,
      page_title: title || document.title,
    },
  });
};

/**
 * React hook for analytics tracking
 * Usage:
 * const analytics = useAnalytics();
 * analytics.track('event_name', { prop: 'value' });
 */
export const useAnalytics = () => {
  // Track page view on mount
  useEffect(() => {
    if (isAnalyticsEnabled()) {
      trackPageView(window.location.pathname);
    }
  }, []);

  const track = useCallback((eventName: string, properties?: Record<string, any>) => {
    trackEvent({ name: eventName, properties });
  }, []);

  const trackPage = useCallback((path?: string, title?: string) => {
    trackPageView(path || window.location.pathname, title);
  }, []);

  return {
    track,
    trackPage,
    isEnabled: isAnalyticsEnabled(),
    enable: enableAnalytics,
    disable: disableAnalytics,
    hasConsent: hasAnalyticsConsent,
    events: AnalyticsEvents,
  };
};
