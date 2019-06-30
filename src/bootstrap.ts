import "reflect-metadata";
import { Rakkit } from "rakkit";
import { ApolloServer } from "apollo-server";

async function bootstrap() {
  await Rakkit.start({
    gql: {
      resolvers: [`${__dirname}/resolvers/*Resolver.ts`]
    }
  });
  const schema = Rakkit.MetadataStorage.Gql.Schema;

  const server = new ApolloServer({
    schema
  });

  server.listen();
}

bootstrap();
