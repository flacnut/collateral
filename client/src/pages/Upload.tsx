import React, { useState } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { Container, Grid } from "@material-ui/core";
import SimpleDropzone, { CSVFile } from "../components/input/SimpleDropzone";
import AccountView from "../components/views/AccountView";
import { getAllAccounts_allAccounts } from "../graphql/types/getAllAccounts";
import AccountSelector from "../components/input/AccountSelector";
import CSVColumnSelectorView from "../components/views/CSVColumnSelectorView";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: 30,
      paddingTop: 80,
      flexGrow: 1,
      boxSizing: "border-box",
    },
    container: {
      marginTop: 20,
      padding: 0,
    },
  })
);

export default function Upload() {
  const classes = useStyles();
  const [
    selectedAccount,
    setSelectedAccount,
  ] = useState<getAllAccounts_allAccounts | null>(null);
  const [pendingFiles, setPendingFiles] = useState<CSVFile[]>([]);

  return (
    <Container className={classes.root}>
      <Grid container spacing={0} direction="column">
        <Grid item>
          <SimpleDropzone
            onFilesDropped={(files: CSVFile[]) => {
              setPendingFiles(pendingFiles.concat(files));
            }}
          />
        </Grid>
        <Grid item>
          <AccountSelector onSelectAccount={setSelectedAccount} />
        </Grid>
        <Grid item>
          <AccountView account={selectedAccount} />
        </Grid>
        <Grid item>
          <CSVColumnSelectorView
            columnHeaders={[]}
            setColumnPairing={() => {}}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
