import React, { useCallback, useState } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Container } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import DescriptionIcon from "@material-ui/icons/Description";
import DescriptionOutlinedIcon from "@material-ui/icons/DescriptionOutlined";

export type CSVFile = {
  file: File;
  header: string[];
  data: string[][];
  meta: Papa.ParseMeta;
};

type Props = {
  onFilesDropped: (files: CSVFile[]) => void;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    alert: {
      textAlign: "left",
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

function parseFile(file: File): Promise<CSVFile> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (pr) => {
        if (pr.errors.length > 0) {
          return reject({ file, ...pr.errors[0] });
        }

        resolve({
          file,
          header: pr.data.slice(0, 1) as string[],
          data: pr.data.slice(1) as string[][],
          meta: pr.meta,
        });
      },
    });
  });
}

export default function SimpleDropzone(props: Props) {
  const classes = useStyles();
  const [error, setError] = useState<
    ({ file: File } & Papa.ParseError) | null
  >();
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);
      // Do something with the files
      Promise.all(acceptedFiles.map(parseFile))
        .then(props.onFilesDropped)
        .catch(setError);
    },
    [props.onFilesDropped, setError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Container {...getRootProps()} className={classes.dropzone}>
      <input {...getInputProps()} />
      {isDragActive ? <DescriptionIcon /> : <DescriptionOutlinedIcon />}

      {error ? (
        <Alert severity="error" className={classes.alert}>
          <AlertTitle>{`Parse Errer in ${error.file.name}`}</AlertTitle>
          {`Row: ${error.row} - ${error.message}`}
        </Alert>
      ) : null}
    </Container>
  );
}
