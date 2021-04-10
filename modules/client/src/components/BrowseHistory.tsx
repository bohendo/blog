import { HistoryResponse, HistoryResponseEntry } from "@blog/types";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import ListItemText from "@material-ui/core/ListItemText";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import ExpandMore from "@material-ui/icons/ExpandMore";
import FastForward from "@material-ui/icons/FastForward";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchHistory, getPrettyDateString } from "../utils";

import { Copyable } from "./Copyable";

const useStyles = makeStyles((theme) => ({
  buttonBar: {
    marginTop: theme.spacing(-1.75),
    paddingLeft: theme.spacing(1),
  },
  paper: {
    border: "1px solid #d3d4d5",
    maxHeight: "50%",
  },
}));

export const BrowseHistory = ({
  currentRef,
  isHistorical,
  latestRef,
  setIsHistorical,
  setLastEdited,
  slug,
}: {
  currentRef: string;
  isHistorical: boolean;
  latestRef: string;
  setIsHistorical: (val: boolean) => void;
  setLastEdited: (val: string) => void;
  slug: string;
}) => {
  const [anchorEl, setAnchorEl] = useState<any>(null); // TODO: provide type?
  const [editHistory, setEditHistory] = useState<HistoryResponse>([]);
  const classes = useStyles();

  useEffect(() => {
    if (latestRef !== currentRef) {
      setIsHistorical(true);
    } else {
      setIsHistorical(false);
    }
  // I don't think state setters (ie setIsHistorical) should be included as a dep
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestRef, currentRef]);

  useEffect(() => {
    if (!slug || slug === "admin") return;
    let unmounted = false;
    (async () => {
      try {
        console.log(`Refreshing history: slug="${slug}" | latestRef="${latestRef}"`);
        const allHistory = (await fetchHistory(slug));

        // Save the date of the most recent edit
        setLastEdited(getPrettyDateString(allHistory[0].timestamp) || "");

        // Discard the most recent edit bc it's the current version
        const history = allHistory.slice(1);

        // Consolidate same-day edits
        const filteredHistory = {} as { [date: string]: HistoryResponseEntry };
        history.forEach(entry => {
          const date = entry.timestamp.split("T")[0];
          if (!filteredHistory[date] || filteredHistory[date].timestamp < entry.timestamp) {
            filteredHistory[date] = entry;
          }
        });

        if (!unmounted) {
          setEditHistory(
            Object.values(filteredHistory)
              .sort((h1, h2) => h1.timestamp < h2.timestamp ? 1 : -1) as HistoryResponse
          );
        }
      } catch (e) {
        console.warn(e.message);
      }
    })();
    return () => { unmounted = true; };
  // Ignore dependency on setLastEdited
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestRef, slug]);

  console.log("editHistory:", editHistory);

  return (
    <Grid container spacing={1} className={classes.buttonBar}>

      <Grid item>
        <Copyable
          id="copy-permalink"
          color="primary"
          size={"medium"}
          text="Permalink"
          tooltip="Snapshot of this page that will never change or disappear"
          value={`${window.location.origin}/${currentRef}/${slug}`}
        />
      </Grid>

      {editHistory.length > 0
        ? <Grid item>
            <Button
              id="open-history"
              startIcon={<ExpandMore/>}
              aria-haspopup="true"
              variant="contained"
              size={"medium"}
              color="primary"
              onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
                setAnchorEl(event.currentTarget);
              }}
            >
              <Typography noWrap variant="button">
                History
              </Typography>
            </Button>
          </Grid>
        : null
      }

      {isHistorical
        ? <Grid item>
            <Tooltip arrow placement="bottom" title="Go to latest version">
              <Button
                color="primary"
                component={Link}
                id="jump-to-present"
                size={"medium"}
                to={`/${slug}`}
                variant="contained"
              >
                <FastForward/>
              </Button>
            </Tooltip>
          </Grid>
        : null
      }

      <Menu
        elevation={0}
        PaperProps={{ id: "history-menu", className: classes.paper }}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        anchorEl={anchorEl}
        keepMounted
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        {
          editHistory.map((entry, i) => {
            const commit = entry.commit.substring(0,8);
            const key = `history-entry-${i+1}`;
            return (
              <MenuItem
                component={Link}
                id={key}
                key={key}
                onClick={() => setAnchorEl(null)}
                selected={commit === currentRef}
                to={`/${commit}/${slug}`}
              >
                <ListItemText primary={getPrettyDateString(entry.timestamp)} />
              </MenuItem>
            );
          })
        }
      </Menu>

    </Grid>
  );
};
