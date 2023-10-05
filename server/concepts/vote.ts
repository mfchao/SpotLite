import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError } from "./errors";

export interface VoteDoc extends BaseDoc {
  user: ObjectId;
  post: ObjectId;
  comment: ObjectId;
  votes: number;
}

export default class VoteConcept {
  public readonly votes = new DocCollection<VoteDoc>("votes");

  async upVote(user: ObjectId, comment?: ObjectId, post?: ObjectId) {
    if (comment && post) {
      throw new BadValuesError("Can't vote for both at the same time!");
    } else if (comment) {
      let vote = await this.votes.readOne({ comment });
      const voteInt = 1;
      const votes = voteInt;

      if (!vote) {
        const _id = await this.votes.createOne({ user, comment, votes });
        return { msg: "Created comment upvote!", vote: await this.votes.readOne({ _id }) };
      } else {
        vote.votes++;
        await this.votes.updateOne({ comment }, vote);
        return { msg: "Upvote comment sucessful!", vote: await this.votes.readOne({ comment }) };
      }
    } else if (post) {
      let vote = await this.votes.readOne({ post });
      const voteInt = 1;
      const votes = voteInt;

      if (!vote) {
        const _id = await this.votes.createOne({ user, post, votes });
        return { msg: "Created post upvote!", vote: await this.votes.readOne({ _id }) };
      } else {
        vote.votes++;
        await this.votes.updateOne({ post }, vote);
        return { msg: "Upvote post sucessful!", vote: await this.votes.readOne({ post }) };
      }
    } else {
      throw new BadValuesError("comment or post must be non-empty!");
    }
  }

  async downVote(user: ObjectId, comment?: ObjectId, post?: ObjectId) {
    if (comment && post) {
      throw new BadValuesError("Can't vote for both at the same time!");
    } else if (comment) {
      let vote = await this.votes.readOne({ comment });
      const voteInt = 1;
      const votes = voteInt;

      if (!vote) {
        const _id = await this.votes.createOne({ user, comment, votes });
        return { msg: "Created downvote comment!", vote: await this.votes.readOne({ _id }) };
      } else {
        vote.votes--;
        await this.votes.updateOne({ comment }, vote);
        return { msg: "Downvote comment sucessful!", vote: await this.votes.readOne({ comment }) };
      }
    } else if (post) {
      let vote = await this.votes.readOne({ post });
      const voteInt = 1;
      const votes = voteInt;

      if (!vote) {
        const _id = await this.votes.createOne({ user, post, votes });
        return { msg: "Created downvote post!", vote: await this.votes.readOne({ _id }) };
      } else {
        vote.votes--;
        await this.votes.updateOne({ post }, vote);
        return { msg: "Downvote post sucessful!", vote: await this.votes.readOne({ post }) };
      }
    } else {
      throw new BadValuesError("comment or post must be non-empty!");
    }
  }

  async getVotes(query: Filter<VoteDoc>) {
    const posts = await this.votes.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return posts;
  }

  async getbyComment(comment: ObjectId) {
    return await this.getVotes({ comment });
  }

  async getbyPost(post: ObjectId) {
    return await this.getVotes({ post });
  }
}
