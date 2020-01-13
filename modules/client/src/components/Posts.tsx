import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { CodeBlockRenderer } from './CodeBlock';

import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Paper,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core';
import {
  ExpandMore as ExpandMoreIcon,
} from '@material-ui/icons';

import { getPostData, getPostContent, getPostIndex } from '../utils';

import { HeadingRenderer } from './HeadingRenderer';

const useStyles = makeStyles((theme: Theme) => createStyles({
  card: {
    maxWidth: 345,
  },
  text: {
    padding: "20px",
    textAlign: "justify",
    fontVariant: "discretionary-ligatures",
  },
}),);

export const PostPage = (props: any) => {
  const classes = useStyles();
  const [postIndex, setPostIndex] = useState(-2);
  const {posts, setPosts} = props;

  useEffect(() => {
    if (posts.length > 0) {
      let index = posts.findIndex((p) => p.slug === props.slug);
      setPostIndex(index);
    }

    if (window.location.hash) {
      // TODO: Find a better way to focus at sub-section at time of load.
      // This is pretty hacky
      window.location.hash = window.location.hash;
    }
  }, [props.slug, window.location.hash, posts]);

  useEffect(() => {
    (async () => {
      if (postIndex >= 0) {
        const postContent = await getPostContent(posts[postIndex].slug);
        if (postContent) {
          posts[postIndex].content = postContent;
          setPosts([
            ...posts,
          ])}
      }
    })()
  }, [postIndex]);

  return (
    <Paper variant="outlined">
      <Markdown
        source={postIndex === -1 ? 'Post Does Not Exist' : (postIndex === -2 ? 'Loading' : posts[postIndex].content)}
        className={classes.text}
        renderers={{ heading: HeadingRenderer, code: CodeBlockRenderer }}
      />
    </Paper>
  )
}

export const PostCard = (props: any) => {
  const classes = useStyles();

  if (!props.post) {
    return <> Loading </>
  }

  return (
     <Card className={classes.card}>
      <CardHeader title={props.post.title} />
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          {props.post.tldr}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton
          component={Link}
          to={`/post/${props.post.slug}`}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </IconButton>
      </CardActions>
    </Card>
  )
}

export const PostCardsLists = (props: any) => {

  const {posts} = props;

  return (
    <>
      {posts.map((post) => {
        return <PostCard key={post.slug} post={post} />
      })}
    </>
  )
}

