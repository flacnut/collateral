import React, { useState } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { Container, Grid, Button } from "@material-ui/core";
import SimpleDropzone, { CSVFile } from "../components/input/SimpleDropzone";
import AccountView from "../components/views/AccountView";
import { getAllAccounts_allAccounts } from "../graphql/types/getAllAccounts";
import AccountSelector from "../components/input/AccountSelector";
import CSVColumnSelectorView, {
  ColumnMap,
} from "../components/views/CSVColumnSelectorView";
import DeleteIcon from "@material-ui/icons/Delete";
import SaveIcon from "@material-ui/icons/Save";
import DescriptionIcon from "@material-ui/icons/Description";

import CircularProgress, {
  CircularProgressProps,
} from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { useMutation } from "@apollo/client";
import Queries from "../graphql/Queries";
import {
  createTransaction,
  createTransaction_createTransaction,
} from "../graphql/types/createTransaction";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
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
    pendingFileView: {
      borderWidth: 1,
      borderColor: theme.palette.secondary.light,
      borderStyle: "solid",
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(2),
      marginTop: theme.spacing(2),
    },
    iconItem: {
      display: "flex",
      alignItems: "center",
    },
    button: {
      minWidth: 100,
      margin: theme.spacing(1),
    },
  })
);

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number }
) {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="determinate" {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography
          variant="caption"
          component="div"
          color="textSecondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

function PendingFileUploadView(props: {
  file: CSVFile;
  onSave: () => void;
  onDelete: () => void;
}) {
  const classes = useStyles();
  const [saving, setSaving] = useState(false);

  return (
    <Container className={classes.pendingFileView}>
      <Grid container direction="row" spacing={2}>
        <Grid item className={classes.iconItem} xs sm>
          <DescriptionIcon />
        </Grid>
        <Grid item xs={10} sm={10}>
          <Grid container direction="column">
            <Grid item>{props.file.file.name}</Grid>
            <Grid item>{props.file.file.size}</Grid>
          </Grid>
        </Grid>
        <Grid item xs sm>
          {saving ? (
            <CircularProgressWithLabel
              value={props.file.savedTransactions / props.file.data.length}
            />
          ) : (
            <>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                className={classes.button}
                startIcon={<DeleteIcon />}
                onClick={props.onDelete}
              >
                Delete
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                className={classes.button}
                startIcon={<SaveIcon />}
                onClick={() => {
                  setSaving(true);
                  props.onSave();
                }}
              >
                Save
              </Button>
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

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
  });

  const [createTransaction] = useMutation<createTransaction>(
    Queries.CREATE_TRANSACTION
  );

  const performSave = (file: CSVFile) => {
    file.data.forEach((row) => {
      createTransaction({
        variables: {
          options: {
            date: row[columnMap.Date],
            originalDescription: row[columnMap.Description],
            friendlyDescription: null,
            amountCents:
              ((Number(row[columnMap.Amount]) ?? 0) +
                (columnMap.SecondaryAmount
                  ? Number(row[columnMap.SecondaryAmount]) ?? 0
                  : 0)) *
              100,
            sourceId: 0,
            accountId: 0,
          },
        },
        refetchQueries: [],
      });
    });
  };

  return (
    <Container className={classes.root}>
      <Grid container spacing={0} direction="column">
        <Grid item>
          <SimpleDropzone
            onFilesDropped={(files: CSVFile[]) => {
              console.dir(files);
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
                onSave={() => performSave(file)}
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
