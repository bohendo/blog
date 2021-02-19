import { IconButton, Link } from "@material-ui/core";
import { Link as LinkIcon } from "@material-ui/icons";
import React from "react";
import emoji from "emoji-dictionary";

import { getChildValue } from "../utils";

import { HashLink } from "./HashLink";

export const EmojiRenderer = text => text.value.replace(/:\w+:/gi, name =>
      emoji.getUnicode(name) || name);

export  const LinkRenderer = (props: any) => {
    return (<Link color="secondary" href={props.href}> {props.children[0].props.value} </Link>);
  };

export  const ImageRenderer = (props: any) => {
    return <img
      { ...props }
      src={props.src}
      alt={props.alt}
      style={{ maxWidth: "90%", display: "block", marginLeft: "auto", marginRight: "auto" }}
    />;
  };

export const HeadingRenderer = (props: any) => {
  if (props.children.length > 1) {
    console.warn("This heading has more than one child..?");
  }

  const value = getChildValue(props.children[0]);

  if (!value) {
    return null;
  }

  const slug = value.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\W+/g, "-");

  return React.createElement(
    `h${props.level}`,
    {
      "data-sourcepos": props["data-sourcepos"],
      "id": slug,
      style: {
        marginTop: "-65px",
        paddingTop: "65px"
      }
    },
    [
      props.children, 
      <IconButton
        color="inherit"
        component={HashLink as any}
        edge="start"
        key={slug}
        title="Link to position on page"
        to={`#${slug}`}
      >
        <LinkIcon />
      </IconButton>
    ]
  );
};
