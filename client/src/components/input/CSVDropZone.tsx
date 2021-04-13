import React, { useCallback, useState, useEffect } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Grid, Paper, Container } from "@material-ui/core";
import DescriptionIcon from "@material-ui/icons/Description";
import DescriptionOutlinedIcon from "@material-ui/icons/DescriptionOutlined";

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
  })
);

function FileUploadSummary(props: {
  file: File;
  parsedResult: Papa.ParseResult<unknown> | null;
  onSave: () => void;
}) {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      {props.file.name}
      {props.parsedResult?.data
        ? JSON.stringify(props.parsedResult.data.pop())
        : "parsing..."}
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
        {files.length > 0 ? <Grid item>Select Account:</Grid> : null}
        {files
          .sort((a, b) => a.file.name.localeCompare(b.file.name))
          .map((fd, i) => (
            <Grid item>
              <FileUploadSummary
                file={fd.file}
                parsedResult={fd.parsedResult}
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
