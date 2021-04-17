import React, { useState } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { Grid, Button, TextField } from "@material-ui/core";
import { useMutation } from "@apollo/client";
import Queries from "../../graphql/Queries";
import { createAccount } from "../../graphql/types/createAccount";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    uploadRoot: {
      padding: 30,
      paddingTop: 80,
      flexGrow: 1,
      boxSizing: "border-box",
    },
    dropzone: {
      textAlign: "center",
      borderWidth: 2,
      borderColor: theme.palette.primary.light,
      borderStyle: "dashed",
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(2),
    },
  })
);

export default function CreateAccountView() {
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [createAccount] = useMutation<createAccount>(Queries.CREATE_ACCOUNT);
  const [institution, setInstitution] = useState("");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");

  const onSave = async () => {
    await createAccount({
      variables: {
        options: {
          accountName: name,
          accountNumber: number,
          institution: institution,
        },
      },
      refetchQueries: [{ query: Queries.GET_ALL_ACCOUNTS }],
    });
    setShowCreateAccount(false);
  };

  return showCreateAccount ? (
    <Grid item>
      <Grid container direction="row" spacing={2}>
        <Grid item>
          <TextField
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            label="Institution"
            variant="outlined"
          />
        </Grid>
        <Grid item>
          <TextField
            value={name}
            onChange={(e) => setName(e.target.value)}
            label="Name"
            variant="outlined"
          />
        </Grid>
        <Grid item>
          <TextField
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            label="Number"
            variant="outlined"
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={onSave}
          >
            Save
          </Button>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <Grid item>
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={() => setShowCreateAccount(true)}
      >
        New Account
      </Button>
    </Grid>
  );
}
