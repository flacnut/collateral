import "./App.css";
import {
  AppBar,
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import { Menu } from "@mui/icons-material";
import { Routes, Route } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useLazyQuery, useMutation } from "@apollo/client";
import Queries from "./graphql/queries";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import { PlaidLinkResponse } from "./graphql/graphql-global-types";

function ThemedApp() {
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  const client = new ApolloClient({
    uri: "http://localhost:4000/graphql",
    cache: new InMemoryCache(),
  });

  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ApolloProvider>
  );
}

function App() {
  const [getLinkToken, { error, data }] = useLazyQuery(Queries.GET_LINK_TOKEN);
  const [setPlaidLinkResponse] = useMutation<PlaidLinkResponse>(Queries.SET_PLAID_LINK_RESPONSE);

  useEffect(() => {
    console.dir(data);
    console.dir(error);
  }, [data, error]);

  const { open, ready } = usePlaidLink({
    token: data?.getLinkToken?.token,
    onSuccess: (public_token, metadata) => {
      console.dir(public_token);
      console.dir(metadata);
      setPlaidLinkResponse({
        variables: {
          plaidLinkResponse: {
            publicToken: public_token,
            linkSessionId: metadata.link_session_id,
            institutionId: metadata.institution?.institution_id
          }
        }
      });
    },
  });

  useEffect(() => {
    if (ready) {
      open();
    }
  }, [ready, open]);

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" enableColorOnDark>
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Collateral
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<div>home</div>} />
            <Route path="transactions" element={<div>transactions</div>} />
            <Route path="accounts" element={<div>accounts</div>} />
            <Route
              path="link"
              element={
                <div>
                  <Button
                    variant="contained"
                    onClick={() => {
                      getLinkToken();
                    }}
                  >
                    Link
                  </Button>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </Box>
    </>
  );
}

export default ThemedApp;
