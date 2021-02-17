import {
  Link,
  Button,
  makeStyles,
  Paper,
} from "@material-ui/core";
import {
  Save,
  Drafts as DraftIcon,
  Public as PublishIcon,
} from "@material-ui/icons";
import React, { useContext, useEffect, useState } from "react";
import Markdown from "react-markdown";
import emoji from "emoji-dictionary";
import ReactMde from "react-mde";
import "react-mde/lib/styles/css/react-mde-all.css";
import axios from "axios";

import { AdminContext } from "../AdminContext";
import { PostData } from "../types";

import { CodeBlockRenderer } from "./CodeBlock";
import { HeadingRenderer } from "./HeadingRenderer";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  button: {
    margin: theme.spacing(1),
  },
  text: {
    padding: "20px",
    textAlign: "justify",
    fontVariant: "discretionary-ligatures",
  },
}));

export const CreateNewPost = () => {

  const classes = useStyles();
  const adminContext = useContext(AdminContext);
  const [newContent, setNewContent] = useState("");
  const [selectedTab, setSelectedTab] = React.useState<"write" | "preview">("write");
  
  useEffect(() => {
    axios.defaults.headers.common["admin-token"] = adminContext.authToken;
  }, [adminContext]);

  const updateGit = async () => {
    console.log("Lets push it to git");
    let path = "new";
    let res = await axios({
      method: "post",
      url: `git/push/${path}`,
      data: newContent,
      headers: { "content-type": "text/plain" }
    });
  }

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

  if (!(adminContext.adminMode && adminContext.authToken)) return <div>Invalid Page</div>
  return (
    <Paper variant="outlined" className={classes.root}>
      <ReactMde
        value={newContent}
        onChange={setNewContent}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        minEditorHeight={400}
        generateMarkdownPreview={(markdown) =>
        Promise.resolve(
          <Markdown
            source={markdown}
            className={classes.text}
            renderers={{
              heading: HeadingRenderer,
              code: CodeBlockRenderer,
              text: emojiSupport,
              link: LinkRenderer,
              image: Image,
            }}
          />
        )}
      />
      <Button
        onClick={updateGit}
        startIcon={<DraftIcon />}
        variant="contained"
        color="secondary"
        className={classes.button}
        size="small"
      >
        Save Draft
      </Button>
      <Button
        onClick={updateGit}
        startIcon={<PublishIcon />}
        variant="contained"
        color="secondary"
        className={classes.button}
        size="small"
      >
        Publish
      </Button>
    </Paper>
  );
};
