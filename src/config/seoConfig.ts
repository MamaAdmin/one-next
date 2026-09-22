export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "one-next",
  "description": "KI-Entwicklung und KI Design Sprints für innovative Unternehmen",
  "url": "https://one-next.de",
  "logo": "https://one-next.de/logo.png",
  "foundingDate": "2020",
  "founder": {
    "@type": "Person",
    "name": "Julia Haitz",
    "jobTitle": "CEO & Gründerin",
    "sameAs": "https://linkedin.com/in/juliha"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Feldstrasse 2",
    "postalCode": "8816",
    "addressLocality": "Hirzel",
    "addressCountry": "CH"
  },
  "email": "info@one-next.com",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "info@one-next.com",
    "availableLanguage": ["de", "en"]
  },
  "sameAs": [
    "https://linkedin.com/company/one-next"
  ]
};

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "one-next",
  "description": "KI-Beratung, Problem Framing, KI Design Sprints und individuelle KI-Entwicklung.",
  "url": "https://one-next.com/",
  "email": "info@one-next.com",
  "founder": {
    "@type": "Person",
    "name": "Julia Haitz"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Feldstrasse 2",
    "postalCode": "8816",
    "addressLocality": "Hirzel",
    "addressCountry": "CH"
  },
  "areaServed": [
    { "@type": "Country", "name": "Schweiz" },
    { "@type": "Country", "name": "Deutschland" }
  ]
};

export const createServiceSchema = (serviceName: string, description: string, url: string) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": serviceName,
  "provider": {
    "@type": "Organization",
    "name": "one-next",
    "url": "https://one-next.de"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Germany"
  },
  "description": description,
  "url": url,
  "availableChannel": {
    "@type": "ServiceChannel",
    "serviceUrl": url
  }
});

export const createEventSchema = (eventName: string, description: string, url: string) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  "name": eventName,
  "description": description,
  "url": url,
  "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
  "eventStatus": "https://schema.org/EventScheduled",
  "organizer": {
    "@type": "Organization",
    "name": "one-next",
    "url": "https://one-next.de"
  },
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "priceCurrency": "EUR"
  }
});

export const createBlogPostingSchema = (
  headline: string,
  description: string,
  author: string,
  datePublished: string,
  url: string,
  imageUrl?: string
) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": headline,
  "description": description,
  "author": {
    "@type": "Person",
    "name": author
  },
  "publisher": {
    "@type": "Organization",
    "name": "one-next",
    "logo": {
      "@type": "ImageObject",
      "url": "https://one-next.de/logo.png"
    }
  },
  "datePublished": datePublished,
  "dateModified": datePublished,
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": url
  },
  ...(imageUrl && {
    "image": {
      "@type": "ImageObject",
      "url": imageUrl
    }
  })
});

export const createBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const createFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Julia Haitz",
  "jobTitle": "CEO & Gründerin",
  "worksFor": {
    "@type": "Organization",
    "name": "one-next"
  },
  "sameAs": "https://linkedin.com/in/juliha",
  "url": "https://one-next.de/about-us"
};
