export interface SharedItem {
  type: "text" | "file";
  text?: string;
  fileName?: string;
  fileSize?: string;
  file?: Blob;
  mimeType?: string;
}
