import React, { useCallback, useState, useEffect } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Grid, Paper, Container } from "@material-ui/core";
import DescriptionIcon from "@material-ui/icons/Description";
import DescriptionOutlinedIcon from "@material-ui/icons/DescriptionOutlined";
import TagMultiSelector from "./TagMultiSelector";

import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

type Account = {
  id: number;
};

type Transaction = {
  date: Date;
  description: string;
  amountCents: number;
};

type Source = {
  fileName: string;
  account: Account;
  transactions: Transaction[];
};

type FileData = {
  file: File;
  parsedResult: Papa.ParseResult<unknown> | null;
  saved: boolean;
};

type Props = {
  onSaveFile: (file: Source) => boolean;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    prompt: {
      textAlign: "center",
    },
    dropzone: {
      borderWidth: 1,
      borderColor: theme.palette.primary.dark,
      borderStyle: "solid",
      borderRadius: theme.shape.borderRadius,
      background: theme.palette.primary.light,
      padding: theme.spacing(2),
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: "center",
      color: theme.palette.text.secondary,
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  })
);

function FileUploadSummary(props: {
  file: File;
  parsedResult: Papa.ParseResult<unknown> | null;
  columns: {
    dateColumn: number | null;
    amountColumn: number | null;
    descriptionColumn: number | null;
  };
  onSave: () => void;
}) {
  const classes = useStyles();
  const data = props.parsedResult?.data ?? [[], []];
  return (
    <Paper className={classes.paper}>
      {props.file.name}
      <br />
      Amount:
      {(data[1] as [])[props.columns.amountColumn ?? 0]}
      <br />
      Description:
      {(data[1] as [])[props.columns.descriptionColumn ?? 0]}
      <br />
      Date:
      {(data[1] as [])[props.columns.dateColumn ?? 0]}
    </Paper>
  );
}

function prepareFile(fd: FileData): Source {
  return {
    fileName: fd.file.name,
    account: {
      id: 0,
    },
    transactions: [],
  };
}

function UploadMenu(props: {
  columnHeaders: string[];
  setAmountColumn: (column: number) => void;
  setDescriptionColumn: (column: number) => void;
  setDateColumn: (column: number) => void;
  dateColumn: number | null;
  amountColumn: number | null;
  descriptionColumn: number | null;
}) {
  const classes = useStyles();
  return (
    <Container>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <TagMultiSelector
            label={"Account"}
            tags={[]}
            onChange={console.dir}
          />
        </Grid>
        <Grid item>
          <Container>
            <Grid container direction="row">
              <Grid item>
                <FormControl variant="outlined" className={classes.formControl}>
                  <InputLabel>Date</InputLabel>
                  <Select
                    value={props.dateColumn}
                    onChange={(e) =>
                      props.setDateColumn(Number(e.target.value))
                    }
                    label="Date"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {props.columnHeaders.map((col, i) => {
                      return <MenuItem value={i}>{col}</MenuItem>;
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl variant="outlined" className={classes.formControl}>
                  <InputLabel>Amount</InputLabel>
                  <Select
                    value={props.amountColumn}
                    onChange={(e) =>
                      props.setAmountColumn(Number(e.target.value))
                    }
                    label="Amount"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {props.columnHeaders.map((col, i) => {
                      return <MenuItem value={i}>{col}</MenuItem>;
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl variant="outlined" className={classes.formControl}>
                  <InputLabel>Description</InputLabel>
                  <Select
                    value={props.descriptionColumn}
                    onChange={(e) =>
                      props.setDescriptionColumn(Number(e.target.value))
                    }
                    label="Description"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {props.columnHeaders.map((col, i) => {
                      return <MenuItem value={i}>{col}</MenuItem>;
                    })}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Container>
        </Grid>
      </Grid>
    </Container>
  );
}

export default function CSVDropZone(props: Props) {
  const classes = useStyles();
  const [files, setFiles] = useState<Array<FileData>>([]);

  useEffect(() => {
    files.forEach((fd, i) => {
      if (!fd.parsedResult) {
        Papa.parse(fd.file, {
          complete: (pr) => {
            const newFiles = [...files];
            newFiles[i].parsedResult = pr;
            setFiles(newFiles);
          },
        });
      }
    });
  }, [files]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Do something with the files
      const fileData = acceptedFiles.map((file: File) => {
        return {
          file: file,
          parsedResult: null,
          saved: false,
        };
      });
      setFiles([...files, ...fileData]);
    },
    [files]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const [dateColumn, setDateColumn] = useState<number | null>(null);
  const [amountColumn, setAmountColumn] = useState<number | null>(null);
  const [descriptionColumn, setDescriptionColumn] = useState<number | null>(
    null
  );

  return (
    <Container className={classes.dropzone}>
      <Grid container direction="column" spacing={2}>
        <Grid item {...getRootProps()} className={classes.prompt}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>
              <DescriptionIcon />
            </p>
          ) : (
            <p>
              <DescriptionOutlinedIcon />
            </p>
          )}
        </Grid>
        {files.length > 0 ? (
          <UploadMenu
            dateColumn={dateColumn}
            amountColumn={amountColumn}
            descriptionColumn={descriptionColumn}
            setDateColumn={setDateColumn}
            setAmountColumn={setAmountColumn}
            setDescriptionColumn={setDescriptionColumn}
            columnHeaders={(files[0].parsedResult?.data[0] as string[]) ?? []}
          />
        ) : null}
        {files
          .sort((a, b) => a.file.name.localeCompare(b.file.name))
          .map((fd, i) => (
            <Grid item>
              <FileUploadSummary
                file={fd.file}
                parsedResult={fd.parsedResult}
                columns={{ dateColumn, amountColumn, descriptionColumn }}
                onSave={() => {
                  const newFiles = [...files];
                  newFiles[i].saved = props.onSaveFile(prepareFile(fd));
                  setFiles(newFiles);
                }}
              />
            </Grid>
          ))}
      </Grid>
    </Container>
  );
}
