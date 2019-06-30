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
    context.gql.pubSub.publish("USER_ADDED", user);
    return user;
  }

  @Subscription({ topics: "USER_ADDED" })
  userAddedNotif(createdUser: User): User {
    return createdUser;
  }
}
