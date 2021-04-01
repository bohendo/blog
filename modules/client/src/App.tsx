import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Snackbar from "@material-ui/core/Snackbar";
import { createStyles, makeStyles, Theme, ThemeProvider } from "@material-ui/core/styles";
import Alert from "@material-ui/lab/Alert";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";

import { AdminHome } from "./components/AdminHome";
import { PostEditor } from "./components/PostEditor";
import { Home } from "./components/Home";
import { NavBar } from "./components/NavBar";
import { PostPage } from "./components/Posts";
import { GitContext } from "./GitContext";
import { darkTheme, lightTheme, getFabStyle } from "./style";
import { AdminMode, GitState, SnackAlert } from "./types";
import {
  defaultSnackAlert, 
  emptyEntry,
  fetchContent,
  fetchIndex,
  fetchRef,
  initialGitState,
  store,
} from "./utils";

const useStyles = makeStyles((theme: Theme) => createStyles({
  appBarSpacer: theme.mixins.toolbar,
  root: {
    display: "flex",
  },
  container: {
    [theme.breakpoints.up("lg")]: {
      width: "80%",
      marginRight: "20%",
    },
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  main: {
    flexGrow: 1,
    marginTop: theme.spacing(2),
    padding: theme.spacing(0.25),
  },
  fab: getFabStyle(theme),
}));

const App: React.FC = () => {
  const classes = useStyles();

  const [gitState, setGitState] = useState(initialGitState);
  const [theme, setTheme] = useState(lightTheme);
  const [adminMode, setAdminMode] = useState<AdminMode>("invalid");
  const [editMode, setEditMode] = useState(false);
  const [snackAlert, setSnackAlert] = useState<SnackAlert>(defaultSnackAlert);

  const categoryMatch = useRouteMatch("/category/:category");
  const slugMatch = useRouteMatch("/:slug");
  const refMatch = useRouteMatch("/:ref/:slug");
  const categoryParam = (categoryMatch ? categoryMatch.params.category : "").toLowerCase();
  const refParam = (categoryParam ? "" : refMatch ? refMatch.params.ref : "").toLowerCase();
  const slugParam = (categoryParam ? "" : refMatch ? refMatch.params.slug
    : slugMatch ? slugMatch.params.slug
    : "").toLowerCase();

  console.log(`Rendering App with refParam=${refParam} and slugParam=${slugParam} and categoryParam=${categoryParam}`);

  const validateAuthToken = async (_authToken?: string) => {
    if (_authToken === "") {
      store.save("authToken", _authToken);
      setSnackAlert({
        open: true,
        msg: "Auth token removed",
        severity: "success",
        hideDuration: 4000,
      });
      setAdminMode("invalid");
      return;
    }
    const authToken = _authToken || store.load("authToken");
    try {
      await axios({
        headers: {
          "authorization": `Basic ${btoa(`admin:${authToken}`)}`,
        },
        method: "post",
        url: "/git",
      });
      // Auth is valid, update localStorage, axios header and adminMode
      store.save("authToken", authToken);
      axios.defaults.headers.common["authorization"] = `Basic ${btoa(`admin:${authToken}`)}`;
      if (_authToken) {
        setSnackAlert({
          open: true,
          msg: "Auth token registered",
          severity: "success",
          hideDuration: 4000,
        });
      }
      setAdminMode("enabled");
    } catch (e) {
      // Got unauthorized response, update localStorage, axios header and adminMode
      if (e?.response?.status === 401) {
        console.error(`Auth token is not valid:`, e);
        store.save("authToken", "");
        axios.defaults.headers.common["authorization"] = `Basic ${btoa(`admin:`)}`;
        if (_authToken) {
          setSnackAlert({
            open: true,
            msg: "Invalid Auth Token",
            severity: "error",
            hideDuration: 4000,
          });
        }
        setAdminMode("invalid");
      } else {
        console.error(`Non-auth server failure:`, e);
      }
    }
  }

  const toggleTheme = () => {
    if (theme.palette.type === "dark") {
      store.save("theme", "light");
      setTheme(lightTheme);
    } else {
      store.save("theme", "dark");
      setTheme(darkTheme);
    }
  };

  const syncGitState = async (ref?: string, slug?: string, getLatest?: boolean) => {
    const latestRef = (getLatest ? null : gitState.latestRef) || await fetchRef();
    const currentRef = ref || latestRef;
    const newGitState = {
      latestRef,
      currentRef,
      slug: slug || "",
      index: await fetchIndex(latestRef),
    } as GitState;
    // console.log(`Syncing ref ${currentRef}${slug ? ` and slug ${slug}` : ""}`);
    if (slug && !["admin", "create-new-post"].includes(slug)) {
      newGitState.currentContent = await fetchContent(slug, currentRef)
      newGitState.indexEntry = (await fetchIndex(currentRef))?.posts?.[slug] || emptyEntry;
    } else {
      newGitState.currentContent = "";
      newGitState.indexEntry = emptyEntry;
    }
    setGitState(newGitState);
  }

  // Run this effect exactly once when the page initially loads
  useEffect(() => {
    window.scrollTo(0, 0);
    // Set theme to local preference
    // console.log("Setting theme & loading authToken");
    const themeSelection = store.load("theme");
    if (themeSelection === "light") setTheme(lightTheme);
    else setTheme(darkTheme);
    validateAuthToken();
  }, []);

  // Fetch index & post content whenever the url changes
  useEffect(() => {
    syncGitState(refParam || gitState.latestRef, slugParam);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refParam, slugParam]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryParam])

  useEffect(() => {
    console.log(`Admin mode set to "${adminMode}"`);
  }, [adminMode])

  return (
    <ThemeProvider theme={theme}>
      <GitContext.Provider value={{ gitState, syncGitState }}>
        <CssBaseline />
        <NavBar
          adminMode={adminMode}
          category={categoryParam}
          setEditMode={setEditMode}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <main className={classes.main}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="xl" className={classes.container}>
            <Switch>
              <Route exact
                path="/"
                render={() => (editMode
                  ? <PostEditor setEditMode={setEditMode} setSnackAlert={setSnackAlert} />
                  : <Home adminMode={adminMode} setEditMode={setEditMode} />
                )}
              />
              <Route exact
                path="/category/:slug"
                render={() => (<Home
                  adminMode={adminMode}
                  filterBy={categoryParam}
                  setEditMode={setEditMode}
                />)}
              />
              <Route exact
                path="/admin"
                render={() => (<AdminHome
                  adminMode={adminMode}
                  setAdminMode={setAdminMode}
                  setEditMode={setEditMode}
                  validateAuthToken={validateAuthToken}
                />)}
              />
              <Route
                path="/:ref/:slug"
                render={() => <PostPage adminMode={adminMode} setEditMode={setEditMode} />}
              />
              <Route
                path="/:slug"
                render={() => (editMode
                  ? <PostEditor setEditMode={setEditMode} setSnackAlert={setSnackAlert} />
                  : <PostPage adminMode={adminMode} setEditMode={setEditMode} />
                )}
              />
            </Switch>
          </Container>
        </main>
      </GitContext.Provider>
      <Snackbar
        id="snackbar"
        open={snackAlert.open}
        autoHideDuration={snackAlert.hideDuration}
        onClose={() => setSnackAlert(defaultSnackAlert)}
      >
        <Alert severity={snackAlert.severity} action={snackAlert.action}>
          {snackAlert.msg}</Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default App;
