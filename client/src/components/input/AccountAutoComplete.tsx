/* eslint-disable no-use-before-define */
import React, { useEffect } from "react";
import Chip from "@material-ui/core/Chip";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Account } from "../../common/types";

type Props = {
  id: string;
  initialValue: Account[];
  options: Account[];
  onChange: (newValue: Account[]) => void;
  variant: "outlined" | "standard";
  className?: string | undefined;
  disabled?: boolean;
};

export default function AccountAutoComplete(props: Props) {
  const [value, setValue] = React.useState(props.initialValue);

  useEffect(() => {
    props.onChange(value);
  }, [props, value]);

  return (
    <Autocomplete
      multiple
      className={props.className}
      id="fixed-accounts-demo"
      value={value}
      disabled={props.disabled}
      onChange={(event, newValue) => {
        setValue(newValue);
      }}
      popupIcon={null}
      options={props.options}
      getOptionLabel={(option) =>
        `${option.institution} - ${option.accountName}`
      }
      renderTags={(accountValue, getAccountProps) =>
        accountValue.map((option, index) => (
          <Chip
            label={`${option.institution} - ${option.accountName}`}
            {...getAccountProps({ index })}
            variant={"default"}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label=""
          variant={props.variant}
          placeholder=""
          className={props.className}
        />
      )}
    />
  );
}
