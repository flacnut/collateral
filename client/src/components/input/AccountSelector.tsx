import React from "react";
import { useQuery } from "@apollo/client";
import Queries from "../../graphql/Queries";
import OutlinedDropdown from "../input/OutlinedDropdown";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { Container } from "@material-ui/core";
import {
  getAllAccounts,
  getAllAccounts_allAccounts,
} from "../../graphql/types/getAllAccounts";

type Props = {
  onSelectAccount: (account: getAllAccounts_allAccounts | null) => void;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginTop: 20,
      padding: 0,
    },
  })
);

export default function AccountSelector(props: Props) {
  const classes = useStyles();
  const { data } = useQuery<getAllAccounts>(Queries.GET_ALL_ACCOUNTS);

  return data && data.allAccounts ? (
    <Container className={classes.container}>
      <OutlinedDropdown
        label="Account"
        options={data?.allAccounts.map((acc) => acc.accountName) ?? []}
        onSetSelectedIndex={(index: number) =>
          props.onSelectAccount(data?.allAccounts[index] ?? null)
        }
      />
    </Container>
  ) : null;
}
