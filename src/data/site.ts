export const nav = [
  { label: 'Platform', href: '/platform/' },
  { label: 'Language Models', href: '/models/' },
  { label: 'AI Consulting', href: '/consulting/' },
  { label: 'Insights', href: '/insights/' },
  { label: 'Resources', href: '/resources/' },
];

// The HESSARA application (platform/), deployed separately. When PUBLIC_APP_URL is set at build
// time, e.g. PUBLIC_APP_URL=https://hessara-platform1.vercel.app, the buttons that start a
// consultation lead into the app; when it is not set they stay on this site.
const app = (import.meta.env.PUBLIC_APP_URL ?? '').trim().replace(/\/+$/, '');
export const appUrl = app;
/** Where a "start a consultation" button leads: the app's new-consultation page, or `fallback` here. */
export const consult = (fallback = '/consulting/') => (app ? `${app}/consult/new` : fallback);
/** A page of the app, or `fallback` on this site when the app is not linked. */
export const appLink = (path: string, fallback: string) => (app ? `${app}${path}` : fallback);

// Public contact address. Leave empty until a real address is confirmed.
export const contactEmail = '';

export const footer = [
  { title: 'Platform', links: [['Platform', '/platform/'], ['Language Models', '/models/'], ['AI Consulting', '/consulting/']] },
  { title: 'Resources', links: [['Insights', '/insights/'], ['Library', '/resources/'], ['Getting Started', '/resources/getting-started/'], ['Security', '/resources/security/']] },
  { title: 'Company', links: [['About Us', '/about/'], ['Contact Us', '/contact/'], ['Careers', '/careers/']] },
  { title: 'Programs', links: [['Programs', '/programs/'], ['Terms & Usability', '/terms/'], ['Privacy Policy', '/privacy/']] },
];
