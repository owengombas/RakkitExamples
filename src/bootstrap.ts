import "reflect-metadata";
import { Rakkit } from "rakkit";
import { ApolloServer } from "apollo-server";

async function bootstrap() {
  await Rakkit.start({
    gql: {
      // Give an array of glob string:
      resolvers: [`${__dirname}/resolvers/*Resolver.ts`]
    }
  });
  // Retrieve the GraphQL compiled schema:
  const schema = Rakkit.MetadataStorage.Gql.Schema;

  const server = new ApolloServer({
    schema
  });

  server.listen();
}

bootstrap();
