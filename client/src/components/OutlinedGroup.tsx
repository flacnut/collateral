import React from "react";
import ReactDOM from "react-dom";
import InputLabel from "@material-ui/core/InputLabel";
import NotchedOutline from "@material-ui/core/OutlinedInput/NotchedOutline";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: "relative",
    },
    content: {
      padding: "18.5px 14px",
    },
    inputLabel: {
      position: "absolute",
      left: 0,
      top: 0,
      // slight alteration to spec spacing to match visual spec result
      transform: "translate(0, 24px) scale(1)",
    },
  })
);

const LabelledOutline = function (props: {
  id: string;
  children: React.ReactNode;
  label: string;
}) {
  const classes = useStyles();
  const [labelWidth, setLabelWidth] = React.useState(0);
  const labelRef = React.useRef(null);

  React.useEffect(() => {
    const labelNode = ReactDOM.findDOMNode(labelRef.current) as HTMLElement;
    setLabelWidth(labelNode != null ? labelNode.offsetWidth : 0);
  }, [props.label]);

  return (
    <div style={{ position: "relative" }}>
      <InputLabel
        ref={labelRef}
        htmlFor={props.id}
        variant="outlined"
        className={classes.inputLabel}
        shrink
      >
        {props.label}
      </InputLabel>
      <div className={classes.root}>
        <div id={props.id} className={classes.content}>
          {props.children}
          <NotchedOutline
            notched
            labelWidth={labelWidth}
            style={{ borderRadius: "4px" }}
          />
        </div>
      </div>
    </div>
  );
};
export default LabelledOutline;
