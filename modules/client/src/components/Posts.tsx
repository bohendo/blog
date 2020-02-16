import {
  createStyles,
  makeStyles,
  Paper,
  Theme,
} from "@material-ui/core";
import React from "react";
import Markdown from "react-markdown";
import emoji from 'emoji-dictionary';

import { CodeBlockRenderer } from "./CodeBlock";
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

  const emojiSupport = text => text.value.replace(/:\w+:/gi, name => emoji.getUnicode(name))

  return (
    <Paper variant="outlined">
      <Markdown
        source={props.content}
        className={classes.text}
        renderers={{
          heading: HeadingRenderer,
          code: CodeBlockRenderer,
          text: emojiSupport,
        }}
      />
    </Paper>
  );
};
