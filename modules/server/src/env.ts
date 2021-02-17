import path from "path";

export type Env = {
  authPassword: string;
  authUsername: string;
  branch: string;
  contentDir: string;
  email: string;
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
  email: process?.env?.BLOG_EMAIL || "noreply@localhost",
  logLevel: process?.env?.BLOG_LOG_LEVEL || "info",
  mirrorKey: process?.env?.BLOG_MIRROR_KEY || "",
  mirrorRef: process?.env?.BLOG_MIRROR_REF || "mirror",
  mirrorUrl: process?.env?.BLOG_MIRROR_URL || "",
  port: parseInt(process?.env?.BLOG_PORT || "8080", 10),
  prodMode: process?.env?.BLOG_PROD === "true",
};
