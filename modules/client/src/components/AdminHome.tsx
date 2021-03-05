import React, { useState } from "react";
import { 
  Button,
  Divider,
  FormControlLabel,
  Switch,
  TextField,
  Theme,
  Typography,
  makeStyles,
} from "@material-ui/core";

import { IndexEditor } from "./IndexEditor";
import { AdminMode } from "../types";

const useStyles = makeStyles((theme: Theme) => ({
  section: {
    margin: theme.spacing(1, 1),
    "& > *": {
      margin: theme.spacing(1),
    }
  },
  button: {
    marginTop: theme.spacing(2)
  },
}));

export const AdminHome = (props: {
  adminMode: AdminMode;
  setAdminMode: (val: AdminMode) => void;
  setEditMode: (val: boolean) => void;
  validateAuthToken: (_authToken?: string) => Promise<void>;
}) => {
  const { adminMode, setAdminMode, setEditMode, validateAuthToken } = props;

  const [authToken, setAuthToken] = useState("");
  const classes = useStyles();

  return (
    <div>
      {adminMode !== "invalid"
        ? (
          <div className={classes.section}>
            <Typography variant="subtitle1">
              This device is registered for Admin access
            </Typography>
          </div>
        )
        : (

          <div className={classes.section}>
            <TextField
              autoComplete={"off"}
              helperText="Register for admin mode"
              id="admin-token"
              label="Admin Token"
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="Admin Token"
              value={authToken}
              variant="outlined"
            />
            <Button
              className={classes.button}
              id="register-admin-token"
              size="small"
              onClick={() => validateAuthToken(authToken)}
              variant="contained"
            >
              Register
            </Button>
          </div>

        )
      }

      <Divider variant="middle" />
      { adminMode !== "invalid"
        ? <FormControlLabel
            id="toggle-admin-mode"
            control={
              <Switch
                size="small"
                checked={adminMode === "enabled"}
                onChange={() => {
                  if (adminMode === "enabled") setAdminMode("disabled");
                  else setAdminMode("enabled");
                }}
              />
            }
            label="Admin Mode"
            labelPlacement="start"
            className={classes.section}
          />
        : <div className={classes.section}>
            <Typography className={classes.section}>
              Supply a valid admin token to activate admin mode
            </Typography>
          </div>
      }
      {adminMode === "enabled"
        ? <div className={classes.section}>
            <IndexEditor setEditMode={setEditMode} />
          </div>
        : null
      }
    </div>
  );
};
