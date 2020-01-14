import React, { useState, useEffect } from 'react';
import {
  PostCardsLists,
  PostPage,
} from './components/Posts';
import { NavBar } from './components/NavBar';
import { Route, Switch } from 'react-router-dom';
import { PostData } from './types';
import { getPostsByCategories, getPosts, getPostIndex } from './utils';

import {
  createStyles,
  makeStyles,
  Container,
  CssBaseline,
  Theme,
} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    backgroundColor: 'linen',
  },
}),);

const App: React.FC = () => {
  const classes = useStyles();
  const [node, setNode] = useState({
    parent: null,
    current: 'categories',
    child: 'posts',
  });
  const [posts, setPosts] = useState([] as PostData[]);
  const [title, setTitle] = useState({primary: '', secondary: ''});

  useEffect(() => {
    (async () => {
      setPosts((await getPosts()));
      const index = await getPostIndex();
      setTitle({...title, primary: index.title});
      document.title = title.primary;
    })()
  }, []);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Container maxWidth="lg">
        <NavBar node={node} setNode={setNode} posts={getPostsByCategories(posts)} title={title}/>
        <main>
          <Switch>
            <Route exact path={["/", "/home"]} >
              <PostCardsLists posts={posts} title={title} setTitle={setTitle} />
            </Route>
            <Route
              path="/post/:slug"
              render={
                ({ match }) => <PostPage title={title} setTitle={setTitle} posts={posts} setPosts={setPosts} slug={match.params.slug} />
              }
            />
          </Switch>
        </main>
      </Container>
    </div>
  );
}

export default App;
