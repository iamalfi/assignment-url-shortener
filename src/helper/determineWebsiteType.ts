import { websiteMappings } from './websiteMapping';

export default function determineWebsiteType(orgUrl: string): any {
  const hostname: string = new URL(orgUrl).hostname;
  let websiteType;
  if (websiteMappings.hasOwnProperty(hostname)) {
    websiteType = websiteMappings[hostname];
  } else {
    websiteType = { name: 'Unknown', shortTag: 'web' }; // Default if the hostname doesn't match any known websites
  }

  // console.log(websiteType);
  // console.log(hostname);
  return websiteType;
}
