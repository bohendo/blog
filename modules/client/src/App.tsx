import React from 'react';
import './App.css';
import {
  PostCardsLists,
  PostPage,
} from './components/Posts';
import { NavBar } from './components/NavBar';
import { Route, Switch } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <div className="App">
      <NavBar />
      <header className="App-header">
      <Switch>
        <Route exact path={["/", "/home"]} >
          <PostCardsLists />
        </Route>
        <Route
          path="/post/:slug"
          render={
            ({ match }) => <PostPage slug={match.params.slug} />
          }
        />
      </Switch>
      </header>
    </div>
  );
}

export default App;
