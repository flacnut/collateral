import React, { useState } from "react";
import { InputLabel, MenuItem, FormControl, Select } from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

type Props = {
  options: string[];
  onSetSelectedIndex: (optionIndex: number) => void;
  label: string;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 180,
    },
  })
);

export default function OutlinedDropdown(props: Props) {
  const classes = useStyles();
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const onSelect = (event: any) => {
    const selectedValue = event.target.value;
    setSelectedOption(selectedValue);
    props.onSetSelectedIndex(selectedValue);
  };

  return (
    <FormControl variant="outlined" className={classes.formControl}>
      <InputLabel>{props.label}</InputLabel>
      <Select value={selectedOption} onChange={onSelect} label={props.label}>
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {props.options.map((text, key) => {
          return (
            <MenuItem key={key} value={key}>
              {text}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
