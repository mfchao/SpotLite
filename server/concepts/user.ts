import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface UserDoc extends BaseDoc {
  username: string;
  password: string;
  spotLiteOption: string;
  bio: string;
  socials: string;
  anonymousMode: boolean;
  profilePhoto?: string;
}

export default class UserConcept {
  public readonly users = new DocCollection<UserDoc>("users");

  async create(username: string, password: string, spotLiteOption: string, bio: string, socials: string, anonymousMode: boolean, photo?: string) {
    await this.canCreate(username, password, spotLiteOption, anonymousMode);
    let profilePhoto;
    if (photo) {
      profilePhoto = photo;
    } else {
      profilePhoto = "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg";
    }
    const _id = await this.users.createOne({ username, password, spotLiteOption, bio, socials, anonymousMode, profilePhoto });
    return { msg: "User created successfully!", user: await this.users.readOne({ _id }) };
  }

  private sanitizeUser(user: UserDoc) {
    // eslint-disable-next-line
    const { password, ...rest } = user; // remove password
    return rest;
  }

  async getUserById(_id: ObjectId) {
    const user = await this.users.readOne({ _id });
    if (user === null) {
      throw new NotFoundError(`User not found!`);
    }
    return this.sanitizeUser(user);
  }

  async getUserByUsername(username: string) {
    const user = await this.users.readOne({ username });
    if (user === null) {
      throw new NotFoundError(`User not found!`);
    }
    return this.sanitizeUser(user);
  }

  //get spotlite pool if exits
  async getSpotLitePool() {
    const usersWithSpotLiteOption = await this.users.readMany({ spotLiteOption: "true" });
    return usersWithSpotLiteOption;
  }

  async getSpotLiteIDs(spotliterIDs: ObjectId[]) {
    return await this.users.readMany({ _id: { $in: spotliterIDs } });
  }

  async idsToUsernames(ids: ObjectId[]) {
    const users = await this.users.readMany({ _id: { $in: ids } });

    // Store strings in Map because ObjectId comparison by reference is wrong
    const idToUser = new Map(users.map((user) => [user._id.toString(), user]));
    return ids.map((id) => idToUser.get(id.toString())?.username ?? "DELETED_USER");
  }

  async getUsers(username?: string) {
    // If username is undefined, return all users by applying empty filter
    const filter = username ? { username } : {};
    const users = (await this.users.readMany(filter)).map(this.sanitizeUser);
    return users;
  }

  async authenticate(username: string, password: string) {
    const user = await this.users.readOne({ username, password });
    if (!user) {
      throw new NotAllowedError("Username or password is incorrect.");
    }
    return { msg: "Successfully authenticated.", _id: user._id };
  }

  async update(_id: ObjectId, update: Partial<UserDoc>) {
    if (update.username !== undefined) {
      await this.isUsernameUnique(update.username);
    }
    await this.users.updateOne({ _id }, update);
    return { msg: "User updated successfully!" };
  }

  async delete(_id: ObjectId) {
    await this.users.deleteOne({ _id });
    return { msg: "User deleted!" };
  }

  async userExists(_id: ObjectId) {
    const maybeUser = await this.users.readOne({ _id });
    if (maybeUser === null) {
      throw new NotFoundError(`User not found!`);
    }
  }

  private async canCreate(username: string, password: string, spotLiteOption: string, anonymousMode: boolean) {
    if (!username || !password || !spotLiteOption || !anonymousMode) {
      throw new BadValuesError("Username, password, spotLiteOption, and anonymousMode must be non-empty!");
    }
    await this.isUsernameUnique(username);
    await this.validateSpotLiteOption(spotLiteOption);
    await this.validateAnonymousMode(anonymousMode);
  }

  private async isUsernameUnique(username: string) {
    if (await this.users.readOne({ username })) {
      throw new NotAllowedError(`User with username ${username} already exists!`);
    }
  }

  private async validateSpotLiteOption(spotLiteOption: any) {
    if (spotLiteOption !== true && spotLiteOption !== false && spotLiteOption !== "true" && spotLiteOption !== "false") {
      throw new BadValuesError("spotLiteOption must be a valid boolean value or string representation ('true' or 'false').");
    }
  }

  private async validateAnonymousMode(anonymousMode: any) {
    if (anonymousMode !== true && anonymousMode !== false && anonymousMode !== "true" && anonymousMode !== "false") {
      throw new BadValuesError("anonymousMode must be a valid boolean value or string representation ('true' or 'false').");
    }
  }
}
