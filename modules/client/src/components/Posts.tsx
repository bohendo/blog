import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { CodeBlockRenderer } from "./CodeBlock";
import {
  Paper,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import { getPostContent } from "../utils";
import { HeadingRenderer } from "./HeadingRenderer";

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
  },
  text: {
    padding: "20px",
    textAlign: "justify",
    fontVariant: "discretionary-ligatures",
  },
}));

export const PostPage = (props: any) => {
  const classes = useStyles();
  const [postIndex, setPostIndex] = useState(-2);
  const {posts, setPosts, title, setTitle} = props;

  useEffect(() => {
    if (posts.length > 0) {
      let index = posts.findIndex((p) => p.slug === props.slug);
      setPostIndex(index);
    }

    if (window.location.hash) {
      // TODO: Find a better way to focus at sub-section at time of load.
      // This is pretty hacky
      // eslint-disable-next-line
      window.location.hash = window.location.hash;
    }
  }, [props.slug, posts]);

  useEffect(() => {
    (async () => {
      if (postIndex >= 0 && !posts[postIndex].content) {
        const postContent = await getPostContent(posts[postIndex].slug);
        if (postContent) {
          posts[postIndex].content = postContent;
          setPosts([
            ...posts,
          ]);
        }
      }
    })();
  }, [postIndex]);

  useEffect(() => {
    if (postIndex >= 0) {
      setTitle({...title, secondary: posts[postIndex].title});
      document.title = `${posts[postIndex].title} | ${title.primary}`;
    }
  }, [props.slug, postIndex]);

  return (
    <Paper variant="outlined">
      <Markdown
        source={postIndex === -1 ? "Post Does Not Exist" : (postIndex === -2 ? "Loading" : posts[postIndex].content)}
        className={classes.text}
        renderers={{ heading: HeadingRenderer, code: CodeBlockRenderer }}
      />
    </Paper>
  );
};
