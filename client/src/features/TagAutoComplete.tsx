/* eslint-disable no-use-before-define */
import React from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";

const filter = createFilterOptions<AutocompleteTag>();

export default function TagAutoComplete(props: {
  tags: Array<AutocompleteTag>;
}) {
  const [value, setValue] = React.useState<AutocompleteTag | null>(null);

  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => {
        if (typeof newValue === "string") {
          setValue(props.tags.filter((t) => t.tag === newValue).pop() ?? null);
        } else if (newValue && newValue.inputValue) {
          // Create a new value from the user input
          setValue({
            tag: newValue.inputValue,
            id: -1,
          });
        } else {
          setValue(newValue);
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        // Suggest the creation of a new value
        if (params.inputValue !== "") {
          filtered.push({
            inputValue: params.inputValue,
            tag: `Add "${params.inputValue}"`,
            id: -1,
          });
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="free-solo-with-text-demo"
      options={props.tags}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === "string") {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }
        // Regular option
        return option.tag;
      }}
      renderOption={(option) => option.tag}
      style={{ width: 300 }}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          label="Free solo with text demo"
          variant="outlined"
        />
      )}
    />
  );
}

interface AutocompleteTag {
  id: number;
  tag: string;
  inputValue?: string;
}
