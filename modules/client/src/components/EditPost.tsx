import "react-mde/lib/styles/css/react-mde-all.css";

import { PostData } from "@blog/types";
import {
  Button,
  Input,
  makeStyles,
  Paper,
  TextField,
} from "@material-ui/core";
import {
  Add,
  Edit,
  Delete,
  Drafts,
  Public,
} from "@material-ui/icons";
import {
  SpeedDial,
  SpeedDialAction
} from "@material-ui/lab";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import Markdown from "react-markdown";
import ReactMde, { SaveImageHandler } from "react-mde";
import { useHistory } from "react-router-dom";

import { GitContext } from "../GitContext";
import { SnackAlert } from "../types";
import { emptyEntry, slugify } from "../utils";

import {
  CodeBlockRenderer,
  TextRenderer,
  HeadingRenderer,
  ImageRenderer,
  LinkRenderer
} from "./Renderers";
import { ImageUploader } from "./ImageUploader";

type EditData = PostData & {
  slug: string | null;
  displaySlug: string
}
const emptyEdit = {
  ...(emptyEntry as any),
  slug: null,
  displaySlug: "",
} as EditData;

type EditPostValidation = {
  hasError: boolean;
  errs: { [entry: string]: string; }
}

const defaultValidation: EditPostValidation = {
  hasError: false,
  errs: {
    title: "",
    slug: "",
  }
};

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
  speedDial: {
    position: "fixed",
    bottom: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      right: "23%",
    },
    [theme.breakpoints.down("sm")]: {
      right: theme.spacing(2),
    },
  },
}));

const getPath = (post: PostData) => {
  if (post?.path) return post.path;
  if (post?.category) return `${post.category}/${post.slug}.md`;
  if (post?.slug) return `${post.slug}.md`;
  return `${slugify(post?.title)}.md`;
};

export const EditPost = (props: {
  setEditMode: any;
  setSnackAlert: (snackAlert: SnackAlert) => void;
}) => {
  const { setEditMode, setSnackAlert } = props;

  const [validation, setValidation] = useState<EditPostValidation>(defaultValidation);
  const [newPostData, setNewPostData] = useState<EditData>(emptyEdit);
  const [newContent, setNewContent] = useState("");
  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const history = useHistory();
  const gitContext = useContext(GitContext);
  const { gitState, syncGitState } = gitContext;
  const { currentContent, slug } = gitState;

  // This should only run once before this component is unmounted
  useEffect(() => {
    // On mount, set initial data to edit
    if (gitState.slug) {
      setNewContent(gitState.currentContent);
      setNewPostData({ ...gitState.indexEntry, displaySlug: "" });
    }
    setValidation(defaultValidation);
    // On unmount, clear edit data
    return () => {
      setNewContent("");
      setNewPostData(emptyEdit);
    };
  }, [gitState]); // gitState will only be updated after turning editMode off

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedPostData = { ...newPostData, [e.target.name]: e.target.value } as EditData;
    updatedPostData.displaySlug = updatedPostData.slug === null
      ? slugify(updatedPostData?.title || "")
      : updatedPostData.slug;
    const titleErr =
      !updatedPostData.title ? "Title is required"
      : "";
    const slugErr =
      !updatedPostData.displaySlug ? "Slug is required"
      : updatedPostData.displaySlug.match(/[^a-z0-9-]/) ? "Slug should only contain a-z, 0-9 and -"
      : "";
    const hasError = !!(slugErr || titleErr);
    setValidation({ errs: { title: titleErr, slug: slugErr }, hasError});
    setNewPostData(updatedPostData);
  }

  const handleImageUpload = (value: string) => {
    setNewPostData({
      ...newPostData,
      img: value,
    });
  };

  const saveImage: SaveImageHandler = async function*(data: ArrayBuffer) {
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

  const update = async () => {
    if (validation.hasError) {
      setSnackAlert({
        open: true,
        msg: "Please enter valid post details",
        severity: "error"
      });
      return;
    }
    const oldIndex = gitState?.index;
    const newIndex = JSON.parse(JSON.stringify(oldIndex))
    const data = [] as Array<{path: string, content: string}>;
    let key;
    if (oldIndex?.posts?.[slug]) {
      key = "posts";
    } else {
      key = "drafts";
    }
    const newPath = getPath(newPostData);
    const oldPath = getPath(oldIndex[key][slug]);
    newIndex[key][slug] = {
      ...newPostData,
      displaySlug: undefined,
      lastEdit: (new Date()).toLocaleDateString("en-in"),
    } as PostData;
    if (currentContent === newContent
      && JSON.stringify(newIndex[key][slug]) === JSON.stringify(oldIndex[key][slug])
    ) {
      console.warn(`Nothing to update`);
      return;
    }
    if (oldPath !== newPath) {
      data.push({ path: oldPath, content: "" });
    }
    data.push({ path: newPath, content: newContent });
    data.push({ path: "index.json", content: JSON.stringify(newIndex, null, 2)});
    const res = await axios({
      data,
      headers: { "content-type": "application/json" },
      method: "post",
      url: "git/edit",
    });
    if (res && res.status === 200 && res.data) {
      setEditMode(false);
      await syncGitState(res.data.commit?.substring(0, 8), slug, true);
    } else {
      console.error(`Something went wrong`, res);
    }
  }

  const createNew = async (as: "drafts" | "posts") => {
    if (validation.hasError) {
      setSnackAlert({
        open: true,
        msg: "Please enter valid post details",
        severity: "error"
      });
      return;
    }
    const newIndex = JSON.parse(JSON.stringify(gitState?.index));
    const path = getPath(newPostData);
    const newPostSlug = newPostData.slug || newPostData.displaySlug;
    if (as === "drafts") {
      if (!newIndex.drafts) newIndex.drafts = {};
      newIndex.drafts[newPostSlug] = {
        ...newPostData,
        displaySlug: undefined,
        lastEdit: (new Date()).toLocaleDateString("en-in"),
        slug: newPostSlug,
      } as PostData;
    } else {
      if (!newIndex.posts) newIndex.posts = {};
      newIndex.posts[newPostSlug] = {
        ...newPostData,
        displaySlug: undefined,
        lastEdit: (new Date()).toLocaleDateString("en-in"),
        publishedOn: (new Date()).toLocaleDateString("en-in"),
        slug: newPostSlug,
      } as PostData;
    }
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
    if (res && res.status === 200 && res.data) {
      setEditMode(false);
      await syncGitState(res.data.commit?.substring(0, 8), newPostSlug, true);
      history.push(`/${newPostSlug}`)
    } else {
      console.error(`Something went wrong`, res);
    }
  };

  // let dialButtonRef;

  const discardConfirm = () => {
    setSnackAlert({
      open: true,
      msg: "Do you want to discard all the changes",
      severity: "warning",
      action: <Button onClick={() => {
        setEditMode(false);
        setSnackAlert({
          open: true,
          msg: "Changes discarded",
          severity: "success",
          hideDuration: 6000,
        })
      }}> Yes </Button>
    });
  };

  return (<>
    <Paper variant="outlined" className={classes.paper}>
      <div className={classes.root}>
        {["title", "category", "slug", "tldr"].map(name => {
          let value = newPostData?.[name] || "";
          if (name === "slug" && newPostData?.[name] === null) {
            value = newPostData.displaySlug;
          }
          return (
            <TextField
              autoComplete={"off"}
              error={!!validation.errs[name]}
              fullWidth={["title", "tldr"].includes(name)}
              helperText={validation.errs[name]}
              id={`edit_${name}`}
              key={`edit_${name}`}
              label={name}
              name={name}
              onChange={handleChange}
              required={["title"].includes(name)}
              value={value}
            />
          )
        })}
        <Input
          id="edit_img"
          value={newPostData?.img || ""}
          endAdornment={ <ImageUploader setImageHash={handleImageUpload} /> }
        />
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
                text: TextRenderer,
                link: LinkRenderer,
                image: ImageRenderer,
              }}
            />
          )}
        paste={{ saveImage }}
      />
    </Paper>
    <SpeedDial
      id={"fab"}
      ariaLabel="fab"
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      className={classes.speedDial}
      icon={slug ? <Edit/> : <Add/>}
      // eslint-disable-next-line
      // FabProps={{ref: (ref) => { dialButtonRef = ref }}}
    >
      {slug === ""
        ?  ([<SpeedDialAction
            FabProps={{id: "fab-discard"}}
            icon={<Delete />}
            key="fab-discard"
            onClick={discardConfirm}
            tooltipTitle="Discard changes"
          />,
          <SpeedDialAction
            FabProps={{id: "fab-draft"}}
            icon={<Drafts />}
            key="fab-draft"
            onClick={() => createNew("drafts")}
            tooltipTitle="Save As Draft"
          />,
          <SpeedDialAction
            FabProps={{id: "fab-publish"}}
            icon={<Public />}
            key="fab-publish"
            onClick={() => createNew("posts")}
            tooltipTitle="Publish"
          />])
        : ([<SpeedDialAction
            FabProps={{id: "fab-discard"}}
            icon={<Delete />}
            key="fab-discard"
            onClick={discardConfirm}
            tooltipTitle="Discard changes"
          />,
          <SpeedDialAction
            FabProps={{id: "fab-save"}}
            icon={<Drafts />}
            key="fab-save"
            onClick={update}
            tooltipTitle="Save"
          />])
      }
    </SpeedDial>
  </>);
};
