export interface UtmParameters {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export function addUtmParameters(url: string, params: UtmParameters): string {
  try {
    const parsedUrl = new URL(url);
    
    if (params.source) {
      parsedUrl.searchParams.set('utm_source', params.source);
    }
    
    if (params.medium) {
      parsedUrl.searchParams.set('utm_medium', params.medium);
    }
    
    if (params.campaign) {
      parsedUrl.searchParams.set('utm_campaign', params.campaign);
    }
    
    if (params.term) {
      parsedUrl.searchParams.set('utm_term', params.term);
    }
    
    if (params.content) {
      parsedUrl.searchParams.set('utm_content', params.content);
    }
    
    return parsedUrl.toString();
  } catch (error) {
    console.error('Error adding UTM parameters:', error);
    return url;
  }
}
