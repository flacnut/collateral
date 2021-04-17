import React, { useState } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { Container, Grid } from "@material-ui/core";
import SimpleDropzone, { CSVFile } from "../components/input/SimpleDropzone";
import AccountView from "../components/views/AccountView";
import { getAllAccounts_allAccounts } from "../graphql/types/getAllAccounts";
import AccountSelector from "../components/input/AccountSelector";
import CSVColumnSelectorView, {
  ColumnMap,
} from "../components/views/CSVColumnSelectorView";
import PendingFileUploadView from "../components/views/PendingFileUploadView";
import CreateAccountView from "../components/views/CreateAccountView";

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

export default function Upload() {
  const classes = useStyles();
  const [
    selectedAccount,
    setSelectedAccount,
  ] = useState<getAllAccounts_allAccounts | null>(null);
  const [pendingFiles, setPendingFiles] = useState<CSVFile[]>([]);
  const [columnMap, setColumnMap] = useState<ColumnMap>({
    Date: 0,
    Description: 0,
    Amount: 0,
    SecondaryAmount: null,
    AmountModifier: 1,
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
        <Grid item>
          <CreateAccountView />
        </Grid>
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
