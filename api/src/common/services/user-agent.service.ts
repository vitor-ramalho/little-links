import { Injectable } from '@nestjs/common';

export interface IUserAgentInfo {
  browser?: string;
  os?: string;
  device?: string;
}

@Injectable()
export class UserAgentService {
  /**
   * Parse user agent string to extract browser, OS, and device info
   * @param userAgent User agent string
   * @returns Object with parsed browser, OS, and device
   */
  parseUserAgent(userAgent: string): IUserAgentInfo {
    // Simple parsing logic for demonstration
    // In a real app, you would use a more robust library
    const info: IUserAgentInfo = {};

    // Browser detection
    if (userAgent.includes('Chrome')) {
      info.browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      info.browser = 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      info.browser = 'Safari';
    } else if (userAgent.includes('Edge')) {
      info.browser = 'Edge';
    } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
      info.browser = 'Internet Explorer';
    } else {
      info.browser = 'Unknown';
    }

    // OS detection
    if (userAgent.includes('Windows')) {
      info.os = 'Windows';
    } else if (userAgent.includes('Mac OS')) {
      info.os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      info.os = 'Linux';
    } else if (userAgent.includes('Android')) {
      info.os = 'Android';
    } else if (
      userAgent.includes('iOS') ||
      userAgent.includes('iPhone') ||
      userAgent.includes('iPad')
    ) {
      info.os = 'iOS';
    } else {
      info.os = 'Unknown';
    }

    // Device detection
    if (userAgent.includes('Mobile')) {
      info.device = 'Mobile';
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      info.device = 'Tablet';
    } else {
      info.device = 'Desktop';
    }

    return info;
  }

  /**
   * Detect source from referrer URL
   * @param referrer Referrer URL
   * @returns Source name
   */
  detectSource(referrer: string): string {
    if (!referrer) {
      return 'Direct';
    }

    try {
      const url = new URL(referrer);
      const hostname = url.hostname.toLowerCase();

      // Check for common sources
      if (hostname.includes('google')) {
        return 'Google';
      }
      if (hostname.includes('bing')) {
        return 'Bing';
      }
      if (hostname.includes('yahoo')) {
        return 'Yahoo';
      }
      if (hostname.includes('facebook')) {
        return 'Facebook';
      }
      if (hostname.includes('twitter') || hostname.includes('x.com')) {
        return 'Twitter';
      }
      if (hostname.includes('instagram')) {
        return 'Instagram';
      }
      if (hostname.includes('linkedin')) {
        return 'LinkedIn';
      }
      if (hostname.includes('reddit')) {
        return 'Reddit';
      }

      // Return domain name if not a known source
      return hostname.replace('www.', '');
    } catch {
      return 'Unknown';
    }
  }
}
