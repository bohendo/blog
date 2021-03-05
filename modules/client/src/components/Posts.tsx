import {
  CardMedia,
  makeStyles,
  Fab,
  Paper,
} from "@material-ui/core";
import { Edit } from "@material-ui/icons";
import React, { useContext, useEffect } from "react";
import Markdown from "react-markdown";
import "react-mde/lib/styles/css/react-mde-all.css";

import { GitContext } from "../GitContext";
import { getFabStyle } from "../style";

import { BrowseHistory } from "./BrowseHistory";
import {
  CodeBlockRenderer,
  TextRenderer,
  HeadingRenderer,
  ImageRenderer,
  LinkRenderer
} from "./Renderers";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: theme.spacing(1, 1),
    "& > *": {
      margin: theme.spacing(1),
    }
  },
  text: {
    padding: "20px",
    textAlign: "justify",
    fontVariant: "discretionary-ligatures",
  },
  media: {
    [theme.breakpoints.up("md")]: {
      height: 500,
    },
    [theme.breakpoints.down("sm")]: {
      height: 300,
    }
  },
  fab: getFabStyle(theme),
}));

export const PostPage = (props: {
  adminMode: string;
  setEditMode: (editMode: boolean) => void;
}) => {
  const { adminMode, setEditMode } = props;
  const gitContext = useContext(GitContext);
  const { currentRef, latestRef, slug, currentContent, indexEntry } = gitContext.gitState;
  const classes = useStyles();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const anchor = document.getElementById(hash.substr(1));
      if (anchor) anchor.scrollIntoView();
    }
  },[indexEntry]);

  return (
  <>
    <BrowseHistory
      currentRef={currentRef}
      latestRef={latestRef}
      slug={slug}
    />

    <Paper variant="outlined" className={classes.root}>
      { indexEntry?.img
        ? <CardMedia image={indexEntry.img} className={classes.media} />
        : null
      }
      <Markdown
        source={currentContent}
        className={classes.text}
        renderers={{
          heading: HeadingRenderer,
          code: CodeBlockRenderer,
          text: TextRenderer,
          link: LinkRenderer,
          image: ImageRenderer,
        }}
      />
    </Paper>
    {adminMode === "enabled"
      ? <Fab
          id={"fab"}
          className={classes.fab}
          color="primary"
          onClick={() => {
            setEditMode(true);
          }}
        ><Edit/></Fab>
      : null
    }
  </>
  );
};
