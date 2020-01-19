export type PostData = {
  category: string;
  slug: string;
  path: string;
  tags: string[];
  tldr: string;
  title: string;
  content?: string;
};

export type PostIndex = {
  posts: { [slug: string]: PostData };
  style?: any;
  title: string;
}
