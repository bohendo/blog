import {
  Input,
  makeStyles,
  Paper,
  TextField,
} from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import Markdown from "react-markdown";
import ReactMde, { SaveImageHandler } from "react-mde";
import "react-mde/lib/styles/css/react-mde-all.css";
import axios from "axios";

import { CodeBlockRenderer } from "./CodeBlock";
import { EmojiRenderer, HeadingRenderer, ImageRenderer, LinkRenderer } from "./Renderers";
import { ImageUploader } from "./ImageUploader";
import { PostData } from "../types";

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

export const EditPost = (props: {
  postData: PostData,
  content: string,
  setPostData: any,
  setContent: any
}) => {

  const { postData, content, setPostData, setContent } = props;

  const classes = useStyles();
  const [selectedTab, setSelectedTab] = React.useState<"write" | "preview">("write");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostData({
      ...postData,
      [e.target.name]: e.target.value
    });
  }

  const handleImageUpload = (value: string) => {
    setPostData({
      ...postData,
      img: value,
    });
  };

  const save: SaveImageHandler = async function*(data: ArrayBuffer) {

    let res = await axios({
      method: "POST",
      url: "ipfs",
      data: data,
      headers: { "content-type": "multipart/form-data"}
    });
    if (res.status === 200) {
      console.log(res);
      yield res.data;
    } else {
      console.log(res);
    }
    return true;
  };

  const fullWidth = ["title", "tldr"];
  return (
    <Paper variant="outlined" className={classes.paper}>
      <div className={classes.root}>
        {["title", "category", "slug", "tldr", "tags", "path"].map(name => (
          <TextField
            id={`post_${name}`}
            label={name}
            name={name}
            value={postData?.[name]}
            fullWidth={fullWidth.includes(name)}
            onChange={handleChange}
          />
        ))}
        <Input
          id="post_img"
          value={postData?.img}
          endAdornment={ <ImageUploader setImageHash={handleImageUpload} /> }
        />
      </div>
      <ReactMde
        value={content}
        onChange={setContent}
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
                text: EmojiRenderer,
                link: LinkRenderer,
                image: ImageRenderer,
              }}
            />
          )}
        paste={{
          saveImage: save
        }}
      />
    </Paper>
  );
};