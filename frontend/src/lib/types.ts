export interface NewsletterEntry {
  created_at: string;
  url: string;
  title: string;
  description: string;
  sponsor: boolean;
  web_dev: boolean;
  tags: string[];
}
