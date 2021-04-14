import React from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { Container, Grid } from "@material-ui/core";
import SimpleDropzone from "../components/input/SimpleDropzone";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: 30,
      paddingTop: 80,
      flexGrow: 1,
      boxSizing: "border-box",
    },
  })
);

export default function Upload() {
  const classes = useStyles();

  return (
    <Container className={classes.root}>
      <Grid container spacing={0} direction="column">
        <Grid item>
          <SimpleDropzone onFilesDropped={console.dir} />
        </Grid>
      </Grid>
    </Container>
  );
}
