import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface VoteDoc extends BaseDoc {
  user: ObjectId;
  post: ObjectId;
  comment: ObjectId;
  upvote: number;
  downvote: number;
}

export default class VoteConcept {
  public readonly votes = new DocCollection<VoteDoc>("votes");

  async upVoteComment(user: ObjectId, comment: ObjectId, upvote: number) {
    const _id = await this.votes.createOne({ user, comment, upvote });
    return { msg: "Upvote sucessful!", vote: await this.votes.readOne({ _id }) };
  }

  async downVoteComment(user: ObjectId, comment: ObjectId, downvote: number) {
    const _id = await this.votes.createOne({ user, comment, downvote });
    return { msg: "Downvote sucessful!", vote: await this.votes.readOne({ _id }) };
  }

  async upVotePost(user: ObjectId, post: ObjectId, upvote: number) {
    const _id = await this.votes.createOne({ user, post, upvote });
    return { msg: "Upvote sucessful!", vote: await this.votes.readOne({ _id }) };
  }

  async downVotePost(user: ObjectId, post: ObjectId, downvote: number) {
    const _id = await this.votes.createOne({ user, post, downvote });
    return { msg: "Downvote sucessful!", vote: await this.votes.readOne({ _id }) };
  }
}
