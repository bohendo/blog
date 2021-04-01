import { PostData } from "@blog/types";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import NavigateBackIcon from "@material-ui/icons/NavigateBefore";
import React, { useContext, useEffect, useState } from "react";
import Markdown from "react-markdown";
import { Link } from "react-router-dom";

import { GitContext } from "../GitContext";
import { PostsByCategory, SidebarNode } from "../types";
import { getChildValue, replaceEmojiString, emptySidebarNode, slugify } from "../utils";

import { HashLink } from "./HashLink";

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
  const headingSlug = slugify(replaceEmojiString(value))
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
    </>
  );
};

export const Toc = ({
  posts,
}: {
  posts: PostsByCategory;
}) => {
  const [node, setNode] = useState<SidebarNode>(emptySidebarNode);
  const gitContext = useContext(GitContext);
  const classes = useStyles();

  const { currentContent, slug, index } = gitContext.gitState

  const byTitle = (pA: PostData, pB: PostData): number =>
    (pA?.title || "").toLowerCase() > (pB?.title || "").toLowerCase() ? 1 : -1;

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
        <Box key={"categories"} textAlign="center" m={1}>
          <Typography>
            CATEGORIES
          </Typography>
        </Box>
        <List component="nav" className={classes.list}>
          {Object.keys(posts).sort().map((c) => {
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
        {posts["top-level"]
          ? posts["top-level"].sort(byTitle).map((p) => {
            return (
              <Box key={p.slug} textAlign="center" m={1}>
                <Button
                  size="small"
                  disableFocusRipple={false}
                  component={Link}
                  to={`/${p.slug}`}
                > {p.title} </Button>
              </Box>
            )})
          : null
        }
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
        <Box key={`post_category_${node.value}`} textAlign="center" m={1}>
          <Typography>
            {node.value.toUpperCase()} POSTS
          </Typography>
        </Box>
        <Divider />
        <List component="nav" className={classes.list}>
          {posts[node.value]
            ? posts[node.value].sort(byTitle).map((p) => {
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
            })
            : <div>
                <ListItem button> No published posts in this category </ListItem>
              </div>
          }
        </List>
        {posts["top-level"]
          ? posts["top-level"].sort(byTitle).map((p) => {
            return (
              <Box key={p.slug} textAlign="center" m={1}>
                <Button
                  size="small"
                  disableFocusRipple={false}
                  component={Link}
                  to={`/${p.slug}`}
                > {p.title} </Button>
              </Box>
            )})
          : null
        }
      </div>
    );

  case "toc":
    return (
      <div className={classes.list}>
        <IconButton
          onClick={() => {
            if (node.value.category) {
              setNode({ parent: "categories", current: "posts", value: node.value.category.toLowerCase() })
            } else {
              setNode({ current: "categories" })
            }
          }}
        >
          <NavigateBackIcon />
        </IconButton>
        <Box key={`post_${node.value.slug}`} textAlign="center" m={1}>
          <Typography>
            TABLE OF CONTENTS
          </Typography>
        </Box>
        <Divider />
        <List component="nav" className={classes.list}>
          <Markdown
            allowedTypes={["text", "heading"]}
            source={currentContent}
            renderers={{ heading: TocGenerator }}
            className={classes.list}
          />
        </List>
        <Divider />
      </div>
    );
  default:
    return null;
  }
};
