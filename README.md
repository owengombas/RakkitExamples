# What?
**Okay then, this is related to my [previous article about Rakkit](https://dev.to/owen/rakkit-create-your-graphql-and-rest-apis-with-typescript-and-decorators-cnj). So I'll advise you to go take a look around 😊.**  
So, here I will show you a more concrete example of what you can do using Rakkit to create a GraphQL API with a user management system.

# But first: the installation of Rakkit 💾
So there are few dependencies that we must install to continue:
> Here, I would use `apollo-server` but it's also possible to install `apollo-server-koa` if you use Rakkit for REST and GraphQL which allows you to link contexts.

Just run this command to install the required dependencies:
```sh
npm i rakkit graphql @types/graphql apollo-server reflect-metadata
```
> reflect-metadata allows us to use the decorators with TypeScript

Okay cool, now we just need to configure TypeScript to enable the decorators by creating a _tsconfig.json_ file at the root of the project, containing this: 
```json
{
  "compileOptions": {
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
      "esnext.asyncitable"
    ],
    "moduleResolution": "node"
  }
}
```
_./tsconfig.json_

# The definitions of types 🚻
Okay then let's start by creating our `User` class, which we'll have to decorate with `@ObjectType()`:
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

# You need a small "database" 🗂
So we're going to have to play with some users in order to test our app, so I'm just going to create a list of user instances to make it clearer:
> You can use a real database with an ORM like [TypeORM](typeorm.io) for your projects
```typescript
import { User } from "../types/User";

export const users = [
  new User("JohnDoe", "john@doe.com"),
  new User("JaneDoe", "jane@doe.com"),
  new User("Ben", "ben@doe.com")
];
```
_./db/users.ts_

# Resolver (Query, Mutation, Subscription) 🚀
It is in the following class that we will define our query/mutation/subscription. It will contain a simple CRUD and a subscription to be notified when a user is registered:
```typescript
import {
  Resolve,
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
  getAllUsers() { {
    return users;
  }

  @Query({ nullable: true })
  getOneUserByName(@Arg("name") name: string): User {
    return users.find((user) => user.name ==== name);
  }

  @Mutation()
  addUser(
    // Defining the mutation arguments
    @Arg("name") name: string,
    @Arg("email") email: string,
    context: IContext
  ): User {
    const user = new User(name, email);
    users.push(user);
    // Publish the event for subscriptions with the created user
    context.gql.pubSub.publish("USER_ADDED", user);
    return user;
  }

  @Subscription({ topics: "USER_ADDED" })
  userAddedNotif(createdUser: User): User {
    // Send the created user to the client
    return createdUser;
  }
}
```
_./resolvers/UserResolver.ts_

# The point of entry 🚪
Now we need to have an entry point for our application:
```typescript
// It allows us to use decorators:
import "reflect-metadata";

import { Rakkit } from "rakkit";
import { ApolloServer } from "apollo-server";

async function bootstrap() {
  await Rakkit.start({
    gql: {
      // You give an array of glob string:
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
```
_./bootstrap.ts_

# Done, so let's start and test it ! 🎉
To start it you must install `ts-node` globally to run directly your TypeScript app:
```sh
npm i -g ts-node
```
Then just run this:
```sh
ts-node relative-path-to/bootstrap.ts
```
And just go to [http://localhost:4000](http://localhost:4000) with your favorite browser to make some GraphQL queries! 🔥

**getAllUsers** - Get all users:
![](https://thepracticaldev.s3.amazonaws.com/i/0t475yrvb22no391rdet.png)

**getOneUserByName** - Get a specific user by name:
![](https://thepracticaldev.s3.amazonaws.com/i/t9woq8td8n9g5dgv2w5w.png)

**addUser** - Add an user:
![](https://thepracticaldev.s3.amazonaws.com/i/ny8bbw3993ynrb7vcenc.png)

**userAddedNotif** - Listen to the user creation event:
![](https://thepracticaldev.s3.amazonaws.com/i/8xt2lbt6zxg0a5ouo6eu.png)

**Et voilà! 😊**