import React from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { Container, Grid } from "@material-ui/core";
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

type Props = {
  columnHeaders: string[];
  setColumnPairing: (csvColmn: string, transactionColumn: string) => void;
};

export default function CSVColumnSelectorView(props: Props) {
  const classes = useStyles();
  return (
    <Container className={classes.container}>
      <OutlinedGroup id="csv-group" label="CSV Columns">
        <Grid container spacing={0} direction="row">
          <Grid item>
            <OutlinedDropdown
              label="Date"
              onSetSelectedIndex={(index) =>
                props.setColumnPairing("Date", props.columnHeaders[index])
              }
              options={props.columnHeaders}
            />
          </Grid>
          <Grid item>
            <OutlinedDropdown
              label="Description"
              onSetSelectedIndex={(index) =>
                props.setColumnPairing(
                  "OriginalDescription",
                  props.columnHeaders[index]
                )
              }
              options={props.columnHeaders}
            />
          </Grid>
          <Grid item>
            <OutlinedDropdown
              label="Amount"
              onSetSelectedIndex={(index) =>
                props.setColumnPairing("Amount", props.columnHeaders[index])
              }
              options={props.columnHeaders}
            />
          </Grid>
          <Grid item>
            <OutlinedDropdown
              label="Amount (optional)"
              onSetSelectedIndex={(index) =>
                props.setColumnPairing(
                  "SecondaryAmount",
                  props.columnHeaders[index]
                )
              }
              options={props.columnHeaders}
            />
          </Grid>
        </Grid>
      </OutlinedGroup>
    </Container>
  );
}
