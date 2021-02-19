import {
  Link,
  Button,
  makeStyles,
  Paper,
  TextField,
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
import { formatTagsArray } from "../utils";

import { CodeBlockRenderer } from "./CodeBlock";
import { HeadingRenderer } from "./HeadingRenderer";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: theme.spacing(1, 1),
    "& > *": {
      margin: theme.spacing(1),
    }
  },
  paper: {
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
  const [post, setPost] = React.useState({} as PostData);
  
  useEffect(() => {
    axios.defaults.headers.common["admin-token"] = adminContext.authToken;
  }, [adminContext]);

  const saveAsDraft = async () => {
    // create new index.json entry
    const newIndex = JSON.parse(JSON.stringify(adminContext.index))
    console.log(adminContext.index);

    const slug = (document.getElementById("post_slug") as HTMLInputElement).value;
    const path = (document.getElementById("post_path") as HTMLInputElement).value;
    const category = (document.getElementById("post_category") as HTMLInputElement).value;
    const title = (document.getElementById("post_title") as HTMLInputElement).value;
    const tldr = (document.getElementById("post_tldr") as HTMLInputElement).value;
    const tags = (document.getElementById("post_tags") as HTMLInputElement).value.split(",");

    if (!newIndex.drafts) newIndex.drafts = {};

    newIndex.drafts[slug] = {
      category,
      lastEdit: (new Date()).toLocaleDateString(),
      path,
      tldr,
      title,
      slug,
      tags,
    };

    console.log(newIndex);

    // Send request to update index.json and create new file
    let res = await axios({
      method: "post",
      url: "git/edit",
      data: [
      {
        path: path,
        content: newContent,
      },
      {
        path: "index.json",
        content: JSON.stringify(newIndex, null, 2),
      }
    ],
      headers: { "content-type": "application/json" }
    });
    
    if (res.status === 200) {
      adminContext.updateIndex(undefined, "index");
    }
  };

  const updateGit = async () => {
    console.log("Lets push it to git");
    //console.log(document.getElementById("post_path"))
    let res = await axios({
      method: "post",
      url: "git/edit",
      data: [{
        path: (document.getElementById("post_path") as HTMLInputElement).value,
        content: newContent,
      }],
      headers: { "content-type": "application/json" }
    });
    console.log(res);
  }

  const handleChange = (event) => {
    console.log(event)
  };

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
    <Paper variant="outlined" className={classes.paper}>
      <div className={classes.root}>
        <TextField id="post_title" label="title" defaultValue={post?.title} fullWidth />
        <TextField id="post_path" label="path" defaultValue={post?.path} fullWidth />
        <TextField id="post_slug" label="slug" defaultValue={post?.slug} />
        <TextField id="post_category" label="category" defaultValue={post?.category} />
        <TextField id="post_tldr" label="tldr" defaultValue={post?.tldr} multiline fullWidth />
        <TextField id="post_img" label="card-img-ipfs#" defaultValue={post?.img} />
        <TextField id="post_tags" label="tags" defaultValue={formatTagsArray(post?.tags)} />
      </div>
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
        onClick={saveAsDraft}
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
