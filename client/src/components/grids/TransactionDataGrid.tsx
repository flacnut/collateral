import React from "react";
import {
  DataGrid,
  GridCellParams,
  GridColumns,
  GridValueFormatterParams,
} from "@material-ui/data-grid";
import { Tag, Transaction } from "../../common/types";
import TagAutoComplete from "../input/TagAutoComplete";
import { makeStyles } from "@material-ui/core/styles";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type Props = {
  transactions: Transaction[];
  tags: Tag[];
  allowEdits: boolean;
};

const useStyles = makeStyles({
  grid: {
    width: "100%",
    "& .expense": {
      color: "#F23753",
    },
    "& .deposit": {
      color: "#3CF237",
    },
    "& .MuiInputBase-root": {
      height: "100%",
    },
    "& .MuiFormControl-root": {
      height: "100%",
    },
    "& .MuiAutocomplete-root": {
      position: "relative",
      height: "100%",
    },
  },
});

export function TransactionDataGrid(props: Props) {
  const columns: GridColumns = [
    {
      field: "date",
      headerName: "Date",
      width: 150,
      type: "date",
    },
    {
      field: "originalDescription",
      headerName: "Description",
      flex: 1,
    },
    {
      field: "amountCents",
      headerName: "Amount",
      valueFormatter: (params: GridValueFormatterParams) => {
        return formatter.format(Math.abs((params.value as number) / 100));
      },
      resizable: true,
      width: 150,
      type: "number",
    },
    {
      field: "tags",
      headerName: "Tags",
      sortable: false,
      flex: 1,
      renderCell: (params: GridCellParams) => (
        <TagAutoComplete
          id={"tag-auto-complete-" + params.id}
          options={props.tags}
          onChange={(t) => {}}
          initialValue={params.value as Tag[]}
          variant="standard"
          mode="select"
          disabled={true}
        />
      ),
    },
  ];

  const classes = useStyles();
  return (
    <DataGrid
      autoHeight={true}
      className={classes.grid}
      rows={props.transactions}
      columns={columns}
      getCellClassName={(params: GridCellParams) => {
        if (params.field === "amountCents") {
          return Number(params.value) >= 0 ? "deposit" : "expense";
        }
        return "";
      }}
    />
  );
}
