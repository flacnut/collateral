import React, { useState } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { Container, Grid, Switch } from "@material-ui/core";
import OutlinedDropdown from "../input/OutlinedDropdown";
import OutlinedGroup from "../OutlinedGroup";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginTop: 20,
      padding: 0,
    },
  })
);

export type ColumnMap = {
  Date: number;
  Description: number;
  Amount: number;
  SecondaryAmount: number | null;
  AmountModifier: -1 | 1;
};

type Props = {
  columnHeaders: string[];
  setColumnPairing: (
    transactionColumn: keyof ColumnMap,
    csvColmn: number
  ) => void;
};

export default function CSVColumnSelectorView(props: Props) {
  const classes = useStyles();
  const [invertAmounts, setInvertAmounts] = useState(false);

  return (
    <Container className={classes.container}>
      <OutlinedGroup id="csv-group" label="CSV Columns">
        <Grid container spacing={0} direction="row">
          <Grid item>
            <OutlinedDropdown
              label="Date"
              onSetSelectedIndex={(index) =>
                props.setColumnPairing("Date", index)
              }
              options={props.columnHeaders}
            />
          </Grid>
          <Grid item>
            <OutlinedDropdown
              label="Description"
              onSetSelectedIndex={(index) =>
                props.setColumnPairing("Description", index)
              }
              options={props.columnHeaders}
            />
          </Grid>
          <Grid item>
            <OutlinedDropdown
              label="Amount"
              onSetSelectedIndex={(index) =>
                props.setColumnPairing("Amount", index)
              }
              options={props.columnHeaders}
            />
          </Grid>
          <Grid item>
            <OutlinedDropdown
              label="Amount (optional)"
              onSetSelectedIndex={(index) =>
                props.setColumnPairing("SecondaryAmount", index)
              }
              options={props.columnHeaders}
            />
          </Grid>
          <Grid item>
            <Switch
              checked={invertAmounts}
              onChange={(e) => {
                setInvertAmounts(e.target.checked);
                props.setColumnPairing(
                  "AmountModifier",
                  e.target.checked ? -1 : 1
                );
              }}
              name="invert_amounts"
              color="primary"
            />
          </Grid>
        </Grid>
      </OutlinedGroup>
    </Container>
  );
}
