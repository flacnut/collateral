/* eslint-disable no-use-before-define */
import React, { useEffect } from "react";
import Chip from "@material-ui/core/Chip";
import TextField from "@material-ui/core/TextField";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import { Tag } from "../../common/types";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";

type Props = {
  id: string;
  initialValue: Tag[];
  options: Tag[];
  onChange: (newValue: Tag[]) => void;
  variant: "outlined" | "standard";
  mode: "select" | "edit";
  className?: string | undefined;
  disabled?: boolean;
};

export default function TagAutoComplete(props: Props) {
  const filter = createFilterOptions<Tag>();

  const isUnsavedTag = (tag: Tag) => {
    return (
      props.initialValue.filter((initialTag) => initialTag.id === tag.id)
        .length === 0
    );
  };

  const isFixedTag = (tag: Tag) => {
    return (
      props.options.find((optionTag) => optionTag.id === tag.id)?.fixed === true
    );
  };

  const fixedOptions = props.initialValue.filter(isFixedTag);
  const [value, setValue] = React.useState([
    ...fixedOptions,
    ...props.initialValue.filter((tag) => !isFixedTag(tag)),
  ]);

  useEffect(() => {
    props.onChange(value);
  }, [props, value]);

  return (
    <Autocomplete
      multiple
      freeSolo={props.mode === "edit" ? true : undefined}
      className={props.className}
      id="fixed-tags-demo"
      value={value}
      disabled={props.disabled}
      onChange={(_, newValue) => {
        setValue([
          ...fixedOptions,
          ...newValue
            .map((nv) => (typeof nv === "string" ? { tag: nv, id: -1 } : nv))
            .filter((tag) => !isFixedTag(tag)),
        ]);
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
        if (params.inputValue !== "" && props.mode === "edit") {
          filtered.push({
            tag: params.inputValue,
            id: -1,
          });
        }

        return filtered;
      }}
      popupIcon={null}
      options={props.options}
      getOptionLabel={(option) => option.tag}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            label={option.tag}
            {...getTagProps({ index })}
            disabled={false}
            variant={
              isUnsavedTag(option) && props.mode === "edit"
                ? "outlined"
                : "default"
            }
            {...(isFixedTag(option) || props.disabled
              ? { onDelete: undefined }
              : {})}
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
