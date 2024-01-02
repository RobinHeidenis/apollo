export interface BaseEntry {
  title: string;
  description: string;
  url: string;
}

export interface BaseEntryWithTags extends BaseEntry {
  tags: string[];
}

export interface Entry extends BaseEntry {
  webdev: boolean;
  sponsor: boolean;
  date: string;
}

export type EntryWithTags = BaseEntryWithTags & Entry;

export interface Message {
  historyId?: string | null;
  id?: string | null;
  internalDate?: string | null;
  labelIds?: string[] | null;
  payload?: MessagePart;
  raw?: string | null;
  sizeEstimate?: number | null;
  snippet?: string | null;
  threadId?: string | null;
}

export interface MessagePart {
  body?: MessagePartBody;
  filename?: string | null;
  headers?: MessagePartHeader[];
  mimeType?: string | null;
  partId?: string | null;
  parts?: MessagePart[];
}

export interface MessagePartBody {
  attachmentId?: string | null;
  data?: string | null;
  size?: number | null;
}

export interface MessagePartHeader {
  name?: string | null;
  value?: string | null;
}

export interface ListMessagesResponse {
  messages?: { id?: string | null; threadId?: string | null }[];
  nextPageToken?: string | null;
  resultSizeEstimate?: number | null;
}
