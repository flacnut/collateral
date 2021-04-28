import React from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";

type Option = {
  id: number;
  name: string;
};

type Props = {
  options?: Option[];
  label: string;
  onChange?: (options: Option[]) => void;
};

function OptionMultiSelector(props: Props) {
  const filter = createFilterOptions<Option>();
  return (
    <Autocomplete
      multiple
      id="options-outlined"
      options={props.options ?? []}
      getOptionLabel={(option) => option.name}
      onChange={(_, value, reason) => {
        props.onChange && props.onChange(value as Option[]);
      }}
      renderOption={(option, { inputValue }) => {
        const matches = match(option.name, inputValue);
        const parts = parse(option.name, matches);

        return (
          <div>
            {parts.map((part, index) => (
              <span
                key={index}
                style={{
                  fontWeight: part.highlight && option.id >= 0 ? 700 : 400,
                  fontStyle: option.id === -1 ? "italic" : "normal",
                }}
              >
                {part.text}
              </span>
            ))}
          </div>
        );
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        // Suggest the creation of a new value
        if (params.inputValue !== "") {
          filtered.push({
            name: params.inputValue,
            id: -1,
          });
        }

        return filtered;
      }}
      popupIcon={null}
      filterSelectedOptions
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label={props.label}
          placeholder=""
        />
      )}
    />
  );
}

export default OptionMultiSelector;
