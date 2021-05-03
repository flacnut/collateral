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
} from "@resolvers";

export default async function StartServer() {
  const app = express();
  const options = await getConnectionOptions(
    process.env.NODE_ENV || "development"
  );
  await createConnection({ ...options, name: "default" });

  await DBInit();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        AccountResolver,
        SourceResolver,
        TransactionResolver,
        TagResolver,
      ],
      validate: true,
    }),
    context: ({ req, res }) => ({ req, res }),
  });

  apolloServer.applyMiddleware({ app, cors: false });
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}/graphql`);
  });
}
