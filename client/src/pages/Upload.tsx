import React, { useState } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { Container, Grid, Button, TextField } from "@material-ui/core";
import SimpleDropzone, { CSVFile } from "../components/input/SimpleDropzone";
import AccountView from "../components/views/AccountView";
import { getAllAccounts_allAccounts } from "../graphql/types/getAllAccounts";
import AccountSelector from "../components/input/AccountSelector";
import CSVColumnSelectorView, {
  ColumnMap,
} from "../components/views/CSVColumnSelectorView";
import PendingFileUploadView from "../components/views/PendingFileUploadView";
import { useMutation } from "@apollo/client";
import Queries from "../graphql/Queries";
import { createAccount } from "../graphql/types/createAccount";

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

function CreateAccountView(props: { onSaveComplete: () => void }) {
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
    props.onSaveComplete();
  };

  return (
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
  );
}

export default function Upload() {
  const classes = useStyles();
  const [
    selectedAccount,
    setSelectedAccount,
  ] = useState<getAllAccounts_allAccounts | null>(null);
  const [pendingFiles, setPendingFiles] = useState<CSVFile[]>([]);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [columnMap, setColumnMap] = useState<ColumnMap>({
    Date: 0,
    Description: 0,
    Amount: 0,
    SecondaryAmount: null,
  });

  return (
    <Container className={classes.uploadRoot}>
      <Grid container spacing={0} direction="column">
        <Grid item>
          <SimpleDropzone
            onFilesDropped={(files: CSVFile[]) =>
              setPendingFiles(pendingFiles.concat(files))
            }
          />
        </Grid>
        <Grid item>
          <AccountSelector onSelectAccount={setSelectedAccount} />
        </Grid>
        {showCreateAccount ? (
          <Grid item>
            <CreateAccountView
              onSaveComplete={() => setShowCreateAccount(false)}
            />
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
        )}

        <Grid item>
          <AccountView account={selectedAccount} />
        </Grid>
        <Grid item>
          <CSVColumnSelectorView
            columnHeaders={
              ((pendingFiles[0]?.header[0] as any) as string[]) ?? []
            }
            setColumnPairing={(transactionColumn, csvColumn) => {
              setColumnMap({ ...columnMap, [transactionColumn]: csvColumn });
            }}
          />
        </Grid>
        {pendingFiles.map((file: CSVFile) => {
          return (
            <Grid item>
              <PendingFileUploadView
                file={file}
                columnMap={columnMap}
                accountId={selectedAccount?.id ?? null}
                onDelete={() =>
                  setPendingFiles(
                    pendingFiles.filter((f) => f.file.name !== file.file.name)
                  )
                }
              />
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}
