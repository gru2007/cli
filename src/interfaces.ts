export interface UppConfig {
   assignees: string[];
   sites: {
      check?: 'tcp-ping' | 'udp-ping' | 'http';
      urlSecretText?: string;
      method?: string;
      name: string;
      url: string;
      port?: number;
      expectedStatusCodes?: number[];
      assignees?: string[];
      headers?: string[];
      slug?: string;
      body?: string;
      icon?: string;
      maxResponseTime?: number;
      maxRedirects?: number;
      __dangerous__insecure?: boolean;
      __dangerous__disable_verify_peer?: boolean;
      __dangerous__disable_verify_host?: boolean;
      __dangerous__body_down?: string;
      __dangerous__body_down_if_text_missing?: string;
      __dangerous__body_degraded?: string;
      __dangerous__body_degraded_if_text_missing?: string;
   }[];
   workflowSchedule?: {
      graphs?: string;
      staticSite?: string;
      summary?: string;
      uptime?: string;
      responseTime?: string;
   };
   commitMessages?: {
      readmeContent?: string;
      summaryJson?: string;
      statusChange?: string;
      graphsUpdate?: string;
      commitAuthorName?: string;
      commitAuthorEmail?: string;
   };
   commitPrefixStatusUp?: string;
   commitPrefixStatusDown?: string;
   commitPrefixStatusDegraded?: string;
   commits?: {
      provider?: '';
   };
   pages?: {
      provider?: '';
   };
   logs?: {
      colors?: boolean;
   };
   notifications?: { type: string; [index: string]: string }[];
   skipGeneratingWebsite: boolean;
   customStatusWebsitePackage: string;
   incidentCommitPrefixOpen?: string;
   incidentCommitPrefixClose?: string;
   incidentCommentPrefix?: string;
   skipDeleteIssues?: boolean;
   skipDescriptionUpdate?: boolean;
   skipTopicsUpdate?: boolean;
   skipPoweredByReadme?: boolean;
   summaryStartHtmlComment?: string;
   summaryEndHtmlComment?: string;
   liveStatusHtmlComment?: string;
   i18n?: {
      up?: string;
      down?: string;
      degraded?: string;
      url?: string;
      status?: string;
      history?: string;
      ms?: string;
      responseTime?: string;
      responseTimeDay?: string;
      responseTimeWeek?: string;
      responseTimeMonth?: string;
      responseTimeYear?: string;
      uptime?: string;
      uptimeDay?: string;
      uptimeWeek?: string;
      uptimeMonth?: string;
      uptimeYear?: string;
      responseTimeGraphAlt?: string;
      liveStatus?: string;
      allSystemsOperational?: string;
      degradedPerformance?: string;
      completeOutage?: string;
      partialOutage?: string;
   } & Record<string, string>;
   'status-website'?: {
      cname?: string;
      logoUrl?: string;
      name?: string;
      introTitle?: string;
      introMessage?: string;
      navbar?: { title: string; url: string }[];
      publish?: boolean;
   };
}
export interface SiteHistory {
   url: string;
   status: 'up' | 'down' | 'degraded';
   code: number;
   responseTime: number;
   lastUpdated?: string;
   startTime?: string;
   generator: 'Upptime <https://github.com/upptime/upptime>';
}
export interface SiteStatus {
   /** Name of site */
   name: string;
   /** Short slug of the site */
   slug: string;
   /** Full URL of the site */
   url: string;
   /** Favicon URL of the site */
   icon: string;
   /** Current status, up or down */
   status: 'up' | 'down' | 'degraded';
   /** Current response time (ms) */
   time: number;
   timeDay: number;
   timeWeek: number;
   timeMonth: number;
   timeYear: number;
   /** Total uptime percentage */
   uptime: string;
   uptimeDay: string;
   uptimeWeek: string;
   uptimeMonth: string;
   uptimeYear: string;
   /** Summary for downtimes */
   dailyMinutesDown: Record<string, number>;
}
export interface Downtimes {
   day: number;
   week: number;
   month: number;
   year: number;
   all: number;
   dailyMinutesDown: Record<string, number>;
}
export interface DownPecentages {
   day: string;
   week: string;
   month: string;
   year: string;
   all: string;
   dailyMinutesDown: Record<string, number>;
}

export interface Incidents {
   useID: number;
   incidents: {
      [id: number]: {
         slug: string;
         labels: string[] | undefined;
         title: string;
         createdAt: number;
         closedAt?: number;
         willCloseAt?: number;
         siteURL?: string;
         /** URL(if any) of where the issue is on the Internet */
         url?: string;
         status: 'open' | 'closed';
      };
   };
}

export interface MemoizedIncidents {
   useID: number;
   incidents: Incidents['incidents'];
   indexes: {
      [slug: string]: number[];
   };
}
