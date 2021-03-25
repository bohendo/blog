import { PostData, Posts } from "@blog/types";
import emoji from "emoji-dictionary";

import { PostsByCategory } from "../types";

export const getPrettyDateString = (dateString: string) => {
  let date = new Date(dateString);
  if (date.toString() === "Invalid Date") {
    return null;
  }
  return date.toLocaleDateString('en', {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const getPath = (post: PostData | undefined): string | undefined => {
  if (!post) return undefined;
  if (post.path) return post.path;
  if (post.category && post?.slug) return `${post.category}/${post.slug}.md`;
  if (post.slug) return `${post.slug}.md`;
  return undefined;
};

export const slugify = (s: string) => s
  .toLocaleLowerCase()
  .replace(/[^a-z0-9_ -]/g, "")
  .replace(/\W/g, "-")
  .replace(/_/g, "-")
  .replace(/-+/g, "-")
  .replace(/^-/g, "")
  .replace(/-$/g, "");

export const replaceEmojiString = (s: string) =>
  s.replace(/:\w+:/gi, name => emoji.getUnicode(name) || name);

export const getChildValue = (child) => {
  if (!child) return;
  if (child.props.value) return child.props.value;
  return getChildValue(child.props.children[0]);
};

export const getPostsByCategories = (posts: Posts): PostsByCategory => {
  return (
    Object.values(posts).reduce((categories, post) => {
      if (post.category) {
        if (post.draft) return ({...categories});
        return ({
          ...categories,
          [post.category.toLocaleLowerCase()]: [
            ...(categories[post.category.toLocaleLowerCase()]||[]),
            post
          ]
        })
      } else {
        return ({
          ...categories,
          "top-level": [ ...(categories["top-level"] || []), post ]
        })
      }
    }, {})
  );
};
