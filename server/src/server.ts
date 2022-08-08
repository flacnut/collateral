import "reflect-metadata";
import { createConnection, getConnectionOptions } from "typeorm";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import DBInit from "./utils/DBInit";
import {
  AccountResolver,
  SourceResolver,
  TransactionResolver,
  TagResolver,
  FilteredTransactionResolver,
} from "@resolvers";

export default async function StartServer() {
  const app = express();
  const options = await getConnectionOptions(
    process.env.NODE_ENV || "development"
  );
  await createConnection({ ...options, name: "default" });

  await DBInit();

  try {
    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        resolvers: [
          AccountResolver,
          SourceResolver,
          TransactionResolver,
          TagResolver,
          FilteredTransactionResolver,
        ],
        validate: true,
      }),
      context: ({ req, res }) => ({ req, res }),
    });

    apolloServer.applyMiddleware({ app, cors: false });
  } catch (err) {
    console.error(err);
    console.dir(JSON.stringify(err));
  }

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}/graphql`);
  });
}
