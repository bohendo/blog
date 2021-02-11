import React, { useContext } from "react";
import { 
  Button,
  Divider,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";

import { AdminContext } from "../AdminContext";

const useStyles = makeStyles((theme: Theme) => ({
  section: {
    margin: theme.spacing(3, 2),
    "& > *": {
      margin: theme.spacing(1),
    }
  },
}));

export const AdminHome = () => {

  const adminContext = useContext(AdminContext);
  const classes = useStyles();

  const handleRegister = () => {
    const authToken = (document.getElementById("auth-token") as HTMLInputElement).value;
    adminContext.updateAuthToken(authToken);
  };

  console.log(adminContext.authToken);

  return (
    <div>
      {adminContext.authToken
        ? (
          <div className={classes.section}>
            <TextField
              disabled
              id="auth-token-registered"
              label="Registered Auth Token"
              variant="outlined"
              value={adminContext.authToken}
            />
          </div>
        )
        : (
          <div className={classes.section}>
            <Typography variant="subtitle1">
              You have not registered this device for Admin access
            </Typography>
          </div>
        )
      }

      <Divider variant="middle" />
      <div className={classes.section}>
        <Typography variant="h6">Use auth token to register this device</Typography>

        <TextField
          id="auth-token"
          label="Auth Token"
          placeholder="AUTH-TOKEN"
          defaultValue={""}
        />

        <Button onClick={handleRegister}> Register </Button>
      </div>
    </div>
  );
};