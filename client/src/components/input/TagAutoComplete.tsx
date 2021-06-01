/* eslint-disable no-use-before-define */
import React from "react";
import Chip from "@material-ui/core/Chip";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Tag } from "../../common/types";

type Props = {
  id: string;
  initialValue: Tag[];
  options: Tag[];
  onChange: (newValue: Tag[]) => void;
};

export default function TagAutoComplete(props: Props) {
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

  return (
    <Autocomplete
      multiple
      id="fixed-tags-demo"
      value={value}
      onChange={(event, newValue) => {
        setValue([
          ...fixedOptions,
          ...newValue.filter((tag) => !isFixedTag(tag)),
        ]);
      }}
      popupIcon={null}
      options={props.options}
      getOptionLabel={(option) => option.tag}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            label={option.tag}
            {...getTagProps({ index })}
            disabled={fixedOptions.indexOf(option) !== -1}
            variant={isUnsavedTag(option) ? "outlined" : "default"}
            {...(isFixedTag(option) ? { onDelete: undefined } : {})}
          />
        ))
      }
      style={{ width: 500 }}
      renderInput={(params) => (
        <TextField {...params} label="" variant="standard" placeholder="" />
      )}
    />
  );
}
