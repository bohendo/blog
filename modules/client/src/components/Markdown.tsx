import IconButton from "@material-ui/core/IconButton";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import LinkIcon from "@material-ui/icons/Link";
import React, { useContext } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark, vs } from "react-syntax-highlighter/dist/esm/styles/prism";

import { GitContext } from "../GitContext";
import { getChildValue, replaceEmojiString, slugify } from "../utils";

import { HashLink } from "./HashLink";

const useStyles = makeStyles((theme) => ({
  blockquote: {
    padding: `0 ${theme.spacing(2)}px`, 
    borderLeft: `${theme.spacing(0.5)}px solid ${theme.palette.divider}`,
    marginLeft: 0,
  },
  text: {
    padding: "20px",
    textAlign: "justify",
    fontVariant: "discretionary-ligatures",
    "& p > img": {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    "& p > img + em": {
      display: "block",
      maxWidth: "80%",
      marginTop: theme.spacing(-3),
      marginRight: "auto",
      marginBottom: theme.spacing(4),
      marginLeft: "auto",
    },
  },
}));

export const CodeBlockRenderer = ({
  children,
  className,
  inline,
  node,
}: {
  children: string;
  className: string;
  inline: boolean
  node: any;
}) => {
  const theme = useTheme();
  const match = /language-(\w+)/.exec(className || '')
  if (inline) {
    return (
      <code className={className}>{getChildValue(node.children[0])}</code>
    );
  } else {
    return (
      <SyntaxHighlighter
        style={theme.palette.type === "dark" ? atomDark : vs}
        language={match ? match[1] : "text"}
        PreTag="div"
        children={String(children).replace(/\n$/, '')}
      />
    )
  }
};

export const LinkRenderer = ({
  node,
  children,
}: {
  node: any;
  children: any[];
}) => {
  return (
    <Link
      color="secondary"
      underline="hover"
      href={node.properties.href}
    >
      {getChildValue(node)}
    </Link>
  );
};

export const HeadingRenderer = ({
  level,
  node,
}: {
  level: number;
  node: any;
}) => {
  console.log("render heading node", node);
  const { currentRef, slug } = useContext(GitContext).gitState;
  const value = getChildValue(node);
  if (!value) {
    console.warn("This heading has no child value..?", value);
    return null;
  }
  const hashlinkSlug = slugify(value)

  return (<>
    <h1 id={hashlinkSlug} style={{ marginTop: "-65px", paddingTop: "65px" }}>
      {value}
      <IconButton
        color="secondary"
        component={HashLink as any}
        edge="start"
        style={{ marginLeft: "2px" }}
        key={hashlinkSlug}
        title="Link to position on page"
        to={`/${currentRef ? `${currentRef}/` : ""}${slug}#${hashlinkSlug}`}
      >
        <LinkIcon />
      </IconButton>
    </h1>
  </>);
};

export const ImageRenderer = ({
  src,
  alt,
  style,
}: {
  src: string;
  alt: string;
  style?: object;
}) => {
    return <img
      src={src}
      alt={alt}
      style={style || {
        display: "block",
        margin: "auto",
        maxWidth: "90%",
      }}
    />;
  };

export const BlockQuoteRenderer = ({
  children,
  key,
  node,
}) => {
  const classes = useStyles();
  if (children.length > 1) {
    console.warn("This blockquote has more than one child..?");
  }
  const value = getChildValue(children[0]);
  if (!value) return null;
  return (
    <blockquote className={classes.blockquote}>
      <Typography color="textSecondary" variant="body2">
        {value}
      </Typography>
    </blockquote>
  )
}

export const Markdown = ({
  content,
}: {
  content: string;
}) => {
  const classes = useStyles();
  return (
    <ReactMarkdown
      className={classes.text}
      components={{
        h1: (props) => <HeadingRenderer {...props} />,
        h2: (props) => <HeadingRenderer {...props} />,
        // h3: (props) => <HeadingRenderer {...props} />,
        // h4: (props) => <HeadingRenderer {...props} />,
        // h5: (props) => <HeadingRenderer {...props} />,
        // h6: (props) => <HeadingRenderer {...props} />,
        a: (props: any) => <LinkRenderer {...props} />,
        img: (props: any) => <ImageRenderer {...props} />,
        code: (props: any) => <CodeBlockRenderer {...props} />,
      }}
    >
      {replaceEmojiString(content)}
    </ReactMarkdown>
  );
}
