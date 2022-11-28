import "reflect-metadata";
import { createConnection, getConnectionOptions } from "typeorm";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import DBInit from "./utils/DBInit";
import jwt from 'jsonwebtoken';
import cors from 'cors';
import bodyParser from 'body-parser';
import {
  AccountResolver,
  SourceResolver,
  TransactionResolver,
  TagResolver,
  FilteredTransactionResolver,
  PlaidResolver,
} from "./resolvers";

import crypto from 'crypto';

const secret = crypto.randomBytes(64).toString('hex');

export default async function StartServer() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.raw());
  app.post('/login', (req, res) => {
    console.dir(req.body);
    const token = jwt.sign(req.body.email, secret);
    res.json(token);
  });

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
          PlaidResolver,
        ],
        validate: true,
      }),
      context: ({ req, res }) => ({ req, res }),
    });

    apolloServer.applyMiddleware({ app, cors: true });
  } catch (err) {
    console.error(err);
    console.dir(JSON.stringify(err));
    process.exit(1);
  }

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}/graphql`);
  });
}
