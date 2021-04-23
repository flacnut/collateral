import React from "react";
import {
  fade,
  makeStyles,
  Theme,
  createStyles,
} from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import Badge from "@material-ui/core/Badge";
import LocalAtm from "@material-ui/icons/LocalAtm";
import SearchIcon from "@material-ui/icons/Search";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import MenuBook from "@material-ui/icons/MenuBook";
import EqualizerIcon from "@material-ui/icons/Equalizer";
import Icon from "@material-ui/core/Icon";
import ReceiptIcon from "@material-ui/icons/Receipt";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1,
    },
    logo: {
      marginRight: theme.spacing(2),
    },
    title: {
      display: "none",
      [theme.breakpoints.up("sm")]: {
        display: "block",
      },
    },
    search: {
      position: "relative",
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      "&:hover": {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      marginRight: theme.spacing(2),
      marginLeft: 0,
      width: "100%",
      [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing(3),
        width: "auto",
      },
    },
    searchIcon: {
      padding: theme.spacing(0, 2),
      height: "100%",
      position: "absolute",
      pointerEvents: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    inputRoot: {
      color: "inherit",
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create("width"),
      width: "100%",
      [theme.breakpoints.up("md")]: {
        width: "20ch",
      },
    },
    sectionDesktop: {
      display: "flex",
    },
  })
);

export default function Banner(props: {
  setSelectedView: (view: string) => void;
}) {
  const classes = useStyles();

  return (
    <div className={classes.grow}>
      <AppBar position="fixed">
        <Toolbar>
          <Icon className={classes.logo}>
            <LocalAtm />
          </Icon>
          <Typography className={classes.title} variant="h5" noWrap>
            Collateral
          </Typography>
          <div className={classes.grow} />
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Search Transactions…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ "aria-label": "search" }}
            />
          </div>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <IconButton
              aria-label="Component Library"
              color="inherit"
              onClick={() => props.setSelectedView("Library")}
            >
              <Badge badgeContent={0} color="secondary">
                <MenuBook />
              </Badge>
            </IconButton>
            <IconButton
              aria-label="Charts"
              color="inherit"
              onClick={() => props.setSelectedView("Charts")}
            >
              <Badge badgeContent={0} color="secondary">
                <EqualizerIcon />
              </Badge>
            </IconButton>
            <IconButton
              aria-label="Transactions"
              color="inherit"
              onClick={() => props.setSelectedView("Transactions")}
            >
              <Badge badgeContent={0} color="secondary">
                <ReceiptIcon />
              </Badge>
            </IconButton>
            <IconButton
              aria-label="Upload"
              color="inherit"
              onClick={() => props.setSelectedView("Upload")}
            >
              <Badge badgeContent={0} color="secondary">
                <CloudUploadIcon />
              </Badge>
            </IconButton>
            <IconButton
              aria-label="Accounts"
              color="inherit"
              onClick={() => props.setSelectedView("Accounts")}
            >
              <Badge badgeContent={0} color="secondary">
                <AccountBalanceIcon />
              </Badge>
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
}
