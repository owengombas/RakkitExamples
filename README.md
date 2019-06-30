# Quoi ?
**Okay alors, ceci est en lien avec mon article précédent, concernant Rakkit. Je vais conseille donc d'aller jetter un petit coup d'oeil.**
Ici je vais donc vous montrer un example plus concret de ce que vous pouvez faire en utilisant Rakkit afin de créer une API GraphQL.
On va prendr eun example très simple, avec un sytème de gestion d'utilisateurs.

# Installation de Rakkit
Alors voici les dépendances à installation afin que l'on puisse contnuer !
> Ici, j'utiliserais `apollo-server` mais il est également possible d'utiliser `apollo-server-koa` si l'on utilise Rakkit pour REST et GraphQL ce qui permet de lier les context.

```sh
npm i rakkit graphql @types/graphql apollo-server reflect-metadata
```

Okay cool, maintenant on doit juste configuer TypeScript pour activer les décorator en créant un fichier tsconfig à la racine du projet, contenant ceci: 
```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "module": "commonjs",
    "target": "es2016",
    "noImplicitAny": false,
    "sourceMap": true,
    "outDir": "build",
    "declaration": true,
    "importHelpers": true,
    "forceConsistentCasingInFileNames": true,
    "lib": [
      "es2016",
      "esnext.asynciterable"
    ],
    "moduleResolution": "node"
  }
}
```
_./tsconfig.json_

# Défénitions des type
Okay alors commençons par créer notre class `User`, qu'il va falloir décorer de `@ObjectType()`:
```typescript
import { ObjectType, Field } from "rakkit";
import * as Crypto from "crypto";

@ObjectType()
export class User {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  id: string;

  // Just to show a computed property:
  @Field(type => String)
  get flatInfos(): string {
    return [this.name, this.email, this.id].join(":");
  }
  
  constructor(username: string, email: string) {
    this.username = username;
    this.email = email;
    this.id = Crypto.randomBytes(16).toString("hex");
  }
}
```
_./types/User.ts_

# Petite base de données
Bon on va devoir jouer avec quelques utilisateurs afin de tester notre app, je vais donc simplement créer une liste d'instance d'ûtilisateurs afin que ce soit plus clair:
```typescript
import { User } from "../types/User";

export const users = [
  new User("JohnDoe", "john@doe.com"),
  new User("JaneDoe", "jane@doe.com"),
  new User("Ben", "ben@doe.com")
]
```
_./db/users.ts_

# Resolver (Query, Mutation, Subscription)
C'est dans la class suivante que l'on va définir la classe nous permettant de créer nos query/mutation/subscription. On va se contente un simple CRUD ainsi que d'une subscription pour être notifier lorsqu'un utilisateur est enregistré:
```typescript
import {
  Resolver,
  Query,
  Mutation,
  Subscription,
  IContext,
  Arg
} from "rakkit";
import { User } from "../types/User";
import { users } from "../db/users";

@Resolver()
export class UserResolver {
  @Query(returns => [User])
  getAllUsers() {
    return users;
  }

  @Query({ nullable: true })
  getOneUserByName(@Arg("name") name: string): User {
    return users.find((user) => user.name === name);
  }

  @Mutation()
  addUser(
    @Arg("name") name: string,
    @Arg("email") email: string,
    context: IContext
  ): User {
    const user = new User(name, email);
    users.push(user);
    context.gql.pubSub.publish("USER_ADDED", user)
    return user;
  }

  @Subscription({ topics: "USER_ADDED" })
  userAddedNotif(payload: User): User {
    return payload;
  }
}
```
_./resolvers/UserResolver.ts_

# Le point d'entrer
Maintenant il nous faut obligatoirement un point d'entrer à notre application:
```typescript
import "reflect-metadata";
import { Rakkit } from "rakkit";
import { ApolloServer } from "apollo-server"

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
```
_./bootstrap.ts_