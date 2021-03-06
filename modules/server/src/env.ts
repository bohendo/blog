import path from "path";

export type Env = {
  authPassword: string;
  authUsername: string;
  branch: string;
  contentDir: string;
  domainname: string;
  email: string;
  ipfsUrl: string;
  maxUploadSize: string;
  logLevel: string;
  mirrorKey: string;
  mirrorRef: string;
  mirrorUrl: string;
  port: number;
  prodMode: boolean;
}

export const env: Env = {
  authPassword: process?.env?.BLOG_AUTH_PASSWORD || "abc123",
  authUsername: process?.env?.BLOG_AUTH_USERNAME || "admin",
  branch: process?.env?.BLOG_BRANCH || "main",
  contentDir: path.normalize(process?.env?.BLOG_INTERNAL_CONTENT_DIR || "/blog-content.git"),
  domainname: process?.env?.BLOG_DOMAINNAME || "localhost",
  email: process?.env?.BLOG_EMAIL || "noreply@localhost",
  ipfsUrl: process?.env?.IPFS_URL || "http://ipfs:5001",
  maxUploadSize: process?.env?.BLOG_MAX_UPLOAD_SIZE || "100mb",
  logLevel: process?.env?.BLOG_LOG_LEVEL || "info",
  mirrorKey: process?.env?.BLOG_MIRROR_KEY || "",
  mirrorRef: process?.env?.BLOG_MIRROR_REF || "mirror",
  mirrorUrl: process?.env?.BLOG_MIRROR_URL || "",
  port: parseInt(process?.env?.BLOG_PORT || "8080", 10),
  prodMode: process?.env?.BLOG_PROD === "true",
};
