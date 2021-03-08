import React, { useContext, useEffect } from "react";
import Markdown from "react-markdown";
import { Link } from "react-router-dom";
import {
  makeStyles,
  Divider,
  IconButton,
  List,
  ListItem,
} from "@material-ui/core";
import {
  NavigateNext as NavigateNextIcon,
  ArrowBackIos as NavigateBackIcon,
} from "@material-ui/icons";

import { GitContext } from "../GitContext";
import { getChildValue, replaceEmojiString } from "../utils";

import { HashLink } from "./HashLink";
import { PostsByCategory, SidebarNode } from "../types";

const useStyles = makeStyles(theme => ({
  list: { width: "100%" },
  list1: { width: "100%", "paddingLeft": theme.spacing(2) },
  list2: { width: "100%", "paddingLeft": theme.spacing(4) },
  list3: { width: "100%", "paddingLeft": theme.spacing(6) },
  list4: { width: "100%", "paddingLeft": theme.spacing(8) },
  list5: { width: "100%", "paddingLeft": theme.spacing(10) },
  tocIcon: {
    marginLeft: theme.spacing(2),
  },
}));

const TocGenerator = ({
  children,
  level
}: {
  children: string[];
  level: number;
}) => {
  const classes = useStyles();

  if (children.length > 1) {
    console.warn("This heading has more than one child..?");
    return null;
  }
  const value = getChildValue(children[0]);
  if (!value) {
    console.warn("This heading has no child values..?");
    return null;
  }
  const headingSlug = value.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\W+/g, "-");
  const heading = replaceEmojiString(value);
  const marginStyle = classes[`list${level || 1}`];

  return (
    <>
      <ListItem
        button
        key={headingSlug}
        className={marginStyle}
        component={HashLink as any}
        to={{ hash:`#${headingSlug}` }}
      >
        {heading}
      </ListItem>
      <Divider />
    </>
  );
};

export const Toc = ({
  node,
  posts,
  setNode,
}: {
  node: SidebarNode;
  posts: PostsByCategory;
  setNode: (val: SidebarNode) => void;
}) => {
  const gitContext = useContext(GitContext);
  const classes = useStyles();

  const { currentContent, slug, index } = gitContext.gitState

  useEffect(() => {
    // Update sidebar node
    if (slug !== "" && index?.posts?.[slug || ""]){
      setNode({ parent: "posts", current: "toc", value: index?.posts?.[slug || ""] });
    } else {
      setNode({ current: "categories" });
    }
  // ignore setNode dep
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, index]);

  switch(node.current) {
  case "categories": 
    return (
      <div className={classes.list}>
        <List component="nav" className={classes.list}>
          {Object.keys(posts).map((c) => {
            if (c !== "top-level") {
              return (
                <div key={c}>
                  <ListItem
                    button
                    onClick={() => setNode({ parent: "categories", current: "posts", value: c })}
                  >
                    {c}
                    <IconButton
                      onClick={() => setNode({
                        parent: "categories",
                        current: "posts", value: c
                      })}
                    >
                      <NavigateNextIcon />
                    </IconButton>
                  </ListItem>
                  <Divider />
                </div>
              );
            } else {
              return null;
            }
          })}
        </List>
      </div>
    );

  case "posts": 
    return (
      <div className={classes.list}>
        <IconButton
          onClick={() => setNode({ 
            current: "categories",
          })}
        >
          <NavigateBackIcon />
        </IconButton>
        <Divider />
        <List component="nav" className={classes.list}>
          {posts[node.value || ""].map((p) => {
            return (
              <div key={p.slug}>
                <ListItem button key={p.title} component={Link} to={`/${p.slug}`} onClick={() =>
                  (slug === p.slug)
                    ? setNode({ parent: "posts", current: "toc", value: p })
                    : null
                  }
                >
                  {p.title}
                </ListItem>
                <Divider />
              </div>
            );
          })}
        </List>
      </div>
    );

  case "toc":
    return (
      <div className={classes.list}>
        <IconButton
          onClick={() => {
            if (node.value.category) {
              setNode({ parent: "categories", current: "posts", value: node.value.category })
            } else {
              setNode({ current: "categories" })
            }
          }}
        >
          <NavigateBackIcon />
        </IconButton>
        <Divider />
        <List component="nav" className={classes.list}>
          <Markdown
            allowedTypes={["text", "heading"]}
            source={currentContent}
            renderers={{ heading: TocGenerator }}
            className={classes.list}
          />
        </List>
      </div>
    );
  default:
    return <div> Hello </div>;
  }
};
