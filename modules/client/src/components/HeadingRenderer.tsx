import { IconButton } from "@material-ui/core";
import { Link as LinkIcon } from "@material-ui/icons";
import React from "react";
import { HashLink as Link } from "react-router-hash-link";
import { getChildValue } from "../utils";

export const HeadingRenderer = (props: any) => {
  if (props.children.length > 1) {
    console.warn("This heading has more than one child..?");
  }

  const value = getChildValue(props.children[0]);

  if (!value) {
    return null;
  }

  let slug = value.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\W+/g, "-");

  return React.createElement(
    `h${props.level}`,
    {
      "data-sourcepos": props["data-sourcepos"],
      "id": slug,
    },
    [
      props.children, 
      <IconButton
        color="inherit"
        component={Link}
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
