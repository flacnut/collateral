import React from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";

type Tag = {
  id: number;
  tag: string;
};

type Props = {
  tags?: Tag[];
  onChange?: (tags: Tag[]) => void;
};

function TagMultiSelector(props: Props) {
  const filter = createFilterOptions<Tag>();
  return (
    <Autocomplete
      multiple
      id="tags-outlined"
      options={props.tags ?? []}
      getOptionLabel={(option) => option.tag}
      onChange={(_, value, reason) => {
        props.onChange && props.onChange(value as Tag[]);
      }}
      renderOption={(option, { inputValue }) => {
        const matches = match(option.tag, inputValue);
        const parts = parse(option.tag, matches);

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
            tag: params.inputValue,
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
          label="Tags Filter"
          placeholder="Favorites"
        />
      )}
    />
  );
}

export default TagMultiSelector;
