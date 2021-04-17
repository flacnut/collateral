import React, { useEffect, useState } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { Container, Grid, Button } from "@material-ui/core";
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
import { createTransaction } from "../../graphql/types/createTransaction";
import { TransactionCreateInput } from "../../graphql/graphql-global-types";

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
  })
);

function calculateTransactionAmountDollars(
  row: string[],
  columnMap: ColumnMap
): number {
  return (
    (Number(row[columnMap.Amount]) ?? 0) +
    (columnMap.SecondaryAmount
      ? Number(row[columnMap.SecondaryAmount]) ?? 0
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

export default function PendingFileUploadView(props: {
  file: CSVFile;
  columnMap: ColumnMap;
  accountId: number | null;
  onDelete: () => void;
}) {
  const classes = useStyles();

  const [saving, setSaving] = useState(false);
  const [unsavedTransactions, setUnsavedTransactions] = useState<
    TransactionCreateInput[]
  >([]);
  const [createTransaction] = useMutation<createTransaction>(
    Queries.CREATE_TRANSACTION
  );

  useEffect(() => {
    async function saveOneTransaction() {
      if (unsavedTransactions.length > 0) {
        const nextTransaction = unsavedTransactions[0];
        await createTransaction({
          variables: {
            options: nextTransaction,
          },
          refetchQueries: [],
        });

        setTimeout(
          () => setUnsavedTransactions(unsavedTransactions.slice(1)),
          0
        );
      }
    }
    saveOneTransaction();
  }, [unsavedTransactions, setUnsavedTransactions, createTransaction]);

  const save = () => {
    setSaving(true);
    setUnsavedTransactions(
      props.file.data
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
            sourceId: 1,
            accountId: props.accountId,
          } as TransactionCreateInput;
        })
        .filter((t) => !isNaN(t.amountCents) && t.date != null)
    );
  };

  const totalTransactionsCount = props.file.data.length;
  const unsavedTransactionsCount = unsavedTransactions.length;

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
            <Grid item>Date: {props.file.data[0][props.columnMap.Date]}</Grid>
            <Grid item>
              Description: {props.file.data[0][props.columnMap.Description]}
            </Grid>
            <Grid item>
              Amount:
              {calculateTransactionAmountDollars(
                props.file.data[0],
                props.columnMap
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid item className={classes.iconItem} xs sm>
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
