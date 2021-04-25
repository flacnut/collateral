import React, { useEffect, useState } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { Container, Grid, Button } from "@material-ui/core";
import { DataGrid, GridColDef } from "@material-ui/data-grid";
import { ColumnMap } from "./CSVColumnSelectorView";
import DeleteIcon from "@material-ui/icons/Delete";
import SaveIcon from "@material-ui/icons/Save";
import DescriptionIcon from "@material-ui/icons/Description";
import { CSVFile } from "../input/SimpleDropzone";
import CircularProgress, {
  CircularProgressProps,
} from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { useMutation } from "@apollo/client";
import Queries from "../../graphql/Queries";
import { createTransactions } from "../../graphql/types/createTransactions";
import {
  TransactionBulkCreateInput,
  TransactionCreateInput,
} from "../../graphql/graphql-global-types";
import { createSource } from "../../graphql/types/createSource";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
    dataPreviewGrid: {
      height: 425,
    },
  })
);

function calculateTransactionAmountDollars(
  row: string[],
  columnMap: ColumnMap
): number {
  return (
    (Number(row[columnMap.Amount]) ?? 0) * columnMap.AmountModifier +
    (columnMap.SecondaryAmount
      ? Number(row[columnMap.SecondaryAmount]) *
          columnMap.SecondaryAmountModifier ?? 0
      : 0)
  );
}

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

type Props = {
  file: CSVFile;
  columnMap: ColumnMap;
  accountId: number | null;
  onDelete: () => void;
};

function TransactionPreviewGrid(props: {
  rows: Array<TransactionCreateInput>;
}) {
  const classes = useStyles();
  const rowsCopy = [...props.rows];
  rowsCopy.sort((a, b) => a.amountCents - b.amountCents);
  const mostAndLeast =
    rowsCopy.length > 6
      ? [...rowsCopy.slice(0, 3), ...rowsCopy.slice(-3)]
      : rowsCopy;

  const columns: GridColDef[] = [
    { field: "date", headerName: "Date", width: 150 },
    { field: "originalDescription", headerName: "Description", width: 400 },
    {
      field: "amount",
      headerName: "Amount",
      width: 150,
    },
  ];
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <DataGrid
      className={classes.dataPreviewGrid}
      rows={mostAndLeast.map((t, i) => {
        return { id: i, amount: formatter.format(t.amountCents / 100), ...t };
      })}
      columns={columns}
    />
  );
}

export default function PendingFileUploadView(props: Props) {
  const classes = useStyles();

  const [saving, setSaving] = useState(false);
  const [unsavedTransactions, setUnsavedTransactions] = useState<
    TransactionCreateInput[]
  >([]);
  const [createTransactions] = useMutation<createTransactions>(
    Queries.CREATE_TRANSACTIONS
  );
  const [createSource] = useMutation<createSource>(Queries.CREATE_SOURCE);

  useEffect(() => {
    async function saveSomeTransactions() {
      if (unsavedTransactions.length > 0) {
        const nextTransactions = unsavedTransactions.slice(0, 20);
        await createTransactions({
          variables: {
            transactions: nextTransactions.map((t) => {
              return {
                date: t.date,
                amountCents: t.amountCents,
                originalDescription: t.originalDescription,
              } as TransactionBulkCreateInput;
            }),
            sourceId: nextTransactions[0].sourceId,
            accountId: nextTransactions[0].accountId,
          },
          refetchQueries: [],
        });

        setTimeout(
          () => setUnsavedTransactions(unsavedTransactions.slice(20)),
          0
        );
      }
    }
    saveSomeTransactions();
  }, [unsavedTransactions, setUnsavedTransactions, createTransactions]);

  const save = async () => {
    setSaving(true);

    const response = await createSource({
      variables: { name: props.file.file.name },
    });

    const sourceId = response.data?.createSource.id;
    if (!sourceId) {
      console.warn("Unable to create source" + JSON.stringify(response));
      return;
    }

    setUnsavedTransactions(generateTransactions(sourceId));
  };

  const generateTransactions = (sourceId: number) => {
    return props.file.data
      .map((row) => {
        return {
          date: row[props.columnMap.Date],
          originalDescription: row[props.columnMap.Description],
          friendlyDescription: null,
          amountCents: Number(
            (
              calculateTransactionAmountDollars(row, props.columnMap) * 100
            ).toFixed(0)
          ),
          sourceId: sourceId,
          accountId: props.accountId,
        } as TransactionCreateInput;
      })
      .filter((t) => !isNaN(t.amountCents) && t.date != null);
  };

  const totalTransactionsCount = props.file.data.length;
  const unsavedTransactionsCount = unsavedTransactions.length;
  const transactions = generateTransactions(-1);

  return (
    <Container className={classes.pendingFileView}>
      <Grid container direction="row" spacing={2}>
        <Grid item className={classes.iconItem} xs sm>
          <DescriptionIcon />
        </Grid>
        <Grid item xs={2} sm={2}>
          <Grid container direction="column">
            <Grid item>File: {props.file.file.name}</Grid>
            <Grid item>Size: {props.file.file.size / 1000} KB</Grid>
            <Grid item>Transactions: {transactions.length}</Grid>
          </Grid>
        </Grid>
        <Grid item xs={8} sm={8}>
          <TransactionPreviewGrid rows={transactions} />
        </Grid>
        <Grid item xs sm>
          {saving ? (
            <CircularProgressWithLabel
              value={Math.round(
                ((totalTransactionsCount - unsavedTransactionsCount) * 100) /
                  totalTransactionsCount
              )}
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
                onClick={save}
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
