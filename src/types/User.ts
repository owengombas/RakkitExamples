import { ObjectType, Field } from "rakkit";
import * as Crypto from "crypto";

@ObjectType()
export class User {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  id: string;

  // Just to show a cocmputed property:
  @Field(type => String)
  get flatInfos(): string {
    return [this.name, this.email, this.id].join(":");
  }

  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
    this.id = Crypto.randomBytes(16).toString("hex");
  }
}
