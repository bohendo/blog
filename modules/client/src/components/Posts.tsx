import {
  Link,
  makeStyles,
  Paper,
} from "@material-ui/core";
import React from "react";
import Markdown from "react-markdown";
import emoji from "emoji-dictionary";

import { CodeBlockRenderer } from "./CodeBlock";
import { HeadingRenderer } from "./HeadingRenderer";

const useStyles = makeStyles(() => ({
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

  const emojiSupport = text =>
    text.value.replace(/:\w+:/gi, name =>
      emoji.getUnicode(name) || name);

  const Image = (props: any) => {
    return <img
      { ...props }
      src={props.src}
      alt={props.alt}
      style={{ maxWidth: "100%", height: "200px", width: "200px" }}
    />;
  };

  const LinkRenderer = (props: any) => {
    return (<Link color="secondary" href={props.href}> {props.children[0].props.value} </Link>);
  };

  return (
    <Paper variant="outlined">
      <Markdown
        source={props.content}
        className={classes.text}
        renderers={{
          heading: HeadingRenderer,
          code: CodeBlockRenderer,
          text: emojiSupport,
          link: LinkRenderer,
          image: Image,
        }}
      />
    </Paper>
  );
};
