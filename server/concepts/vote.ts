import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotFoundError } from "./errors";

export interface VoteDoc extends BaseDoc {
  users: ObjectId[];
  post: ObjectId;
  comment: ObjectId;
  upvotes: number;
  downvotes: number;
}

export default class VoteConcept {
  public readonly votes = new DocCollection<VoteDoc>("votes");

  async upVote(user: ObjectId, comment?: ObjectId, post?: ObjectId) {
    if (comment && post) {
      throw new BadValuesError("Can't vote for both at the same time!");
    } else if (comment) {
      let upvoteComment = await this.votes.readOne({ comment });
      const voteInt = 1;
      const upvotes = voteInt;

      if (!upvoteComment) {
        const _id = await this.votes.createOne({ comment, upvotes });
        await this.updateUsers(_id, user);
        return { msg: "Created comment upvote!", upvote: await this.votes.readOne({ _id }) };
      } else if (!upvoteComment.upvotes) {
        upvoteComment.upvotes = voteInt;
        await this.updateUsers(upvoteComment._id, user);
        await this.votes.updateOne({ comment }, upvoteComment);

        return { msg: "Created comment upvote!", upvote: await this.votes.readOne({ comment }) };
      } else {
        upvoteComment.upvotes++;
        await this.updateUsers(upvoteComment._id, user);

        await this.votes.updateOne({ comment }, upvoteComment);
        return { msg: "Upvote comment sucessful!", upvote: await this.votes.readOne({ comment }) };
      }
    } else if (post) {
      let upvotePost = await this.votes.readOne({ post });
      const voteInt = 1;
      const upvotes = voteInt;

      if (!upvotePost) {
        const _id = await this.votes.createOne({ post, upvotes });
        await this.updateUsers(_id, user);
        return { msg: "Created post upvote!", upvote: await this.votes.readOne({ _id }) };
      } else if (!upvotePost.upvotes) {
        upvotePost.upvotes = voteInt;
        await this.updateUsers(upvotePost._id, user);
        await this.votes.updateOne({ comment }, upvotePost);

        return { msg: "Created post upvote!", upvote: await this.votes.readOne({ comment }) };
      } else {
        upvotePost.upvotes++;
        await this.updateUsers(upvotePost._id, user);
        await this.votes.updateOne({ post }, upvotePost);

        return { msg: "Upvote post sucessful!", upvote: await this.votes.readOne({ post }) };
      }
    } else {
      throw new BadValuesError("comment or post must be non-empty!");
    }
  }

  async downVote(user: ObjectId, comment?: ObjectId, post?: ObjectId) {
    if (comment && post) {
      throw new BadValuesError("Can't vote for both at the same time!");
    } else if (comment) {
      let downvoteComment = await this.votes.readOne({ comment });
      const voteInt = 1;
      const downvotes = voteInt;

      if (!downvoteComment) {
        const _id = await this.votes.createOne({ comment, downvotes });
        await this.updateUsers(_id, user);
        return { msg: "Created downvote comment!", downvote: await this.votes.readOne({ _id }) };
      } else if (!downvoteComment.downvotes) {
        downvoteComment.downvotes = voteInt;
        await this.updateUsers(downvoteComment._id, user);
        await this.votes.updateOne({ comment }, downvoteComment);

        return { msg: "Created comment downvote!", upvote: await this.votes.readOne({ comment }) };
      } else {
        downvoteComment.downvotes++;
        await this.updateUsers(downvoteComment._id, user);
        await this.votes.updateOne({ comment }, downvoteComment);

        return { msg: "Downvote comment sucessful!", vote: await this.votes.readOne({ comment }) };
      }
    } else if (post) {
      let downvotePost = await this.votes.readOne({ post });
      const voteInt = 1;
      const downvotes = voteInt;

      if (!downvotePost) {
        const _id = await this.votes.createOne({ post, downvotes });
        await this.updateUsers(_id, user);
        return { msg: "Created downvote post!", vote: await this.votes.readOne({ _id }) };
      } else if (!downvotePost.downvotes) {
        downvotePost.downvotes = voteInt;
        await this.updateUsers(downvotePost._id, user);
        await this.votes.updateOne({ comment }, downvotePost);

        return { msg: "Created post downvote!", upvote: await this.votes.readOne({ comment }) };
      } else {
        downvotePost.downvotes++;
        await this.updateUsers(downvotePost._id, user);
        await this.votes.updateOne({ post }, downvotePost);

        return { msg: "Downvote post sucessful!", vote: await this.votes.readOne({ post }) };
      }
    } else {
      throw new BadValuesError("comment or post must be non-empty!");
    }
  }

  async updateUsers(_id: ObjectId, user: ObjectId) {
    let newUpvote = await this.votes.readOne({ _id });
    if (newUpvote) {
      newUpvote.users = newUpvote.users ? [...newUpvote.users, user] : [user];
      await this.votes.updateOne({ _id: _id }, newUpvote);
    } else {
      throw new BadValuesError("Id isn't found!");
    }
  }

  async removeUser(_id: ObjectId, user: ObjectId) {
    let vote = await this.votes.readOne({ _id });
    if (vote) {
      let index = vote.users.indexOf(user);
      if (index !== -1) {
        vote.users.splice(index, 1);
      }
      await this.votes.updateOne({ _id: _id }, vote);
    } else {
      throw new BadValuesError("Id isn't found!");
    }
  }

  async removeUpvote(user: ObjectId, comment?: ObjectId, post?: ObjectId) {
    if (comment && post) {
      throw new BadValuesError("Can't vote for both at the same time!");
    } else if (comment) {
      let upvoteComment = await this.votes.readOne({ comment });
      if (!upvoteComment) {
        throw new NotFoundError("Parent Comment not found!");
      } else if (!upvoteComment.upvotes || upvoteComment.upvotes === 0) {
        throw new NotFoundError("No upvotes found!");
      } else {
        upvoteComment.upvotes--;
        await this.removeUser(upvoteComment._id, user);
        await this.votes.updateOne({ comment }, upvoteComment);
        return { msg: "Removed comment upvote!", upvote: await this.votes.readOne({ comment }) };
      }
    } else if (post) {
      let upvotePost = await this.votes.readOne({ post });
      if (!upvotePost) {
        throw new NotFoundError("Parent Post not found!");
      } else if (!upvotePost.upvotes || upvotePost.upvotes === 0) {
        throw new NotFoundError("No upvotes found!");
      } else {
        upvotePost.upvotes--;
        await this.removeUser(upvotePost._id, user);
        await this.votes.updateOne({ post }, upvotePost);
        return { msg: "Removed comment upvote!", upvote: await this.votes.readOne({ post }) };
      }
    } else {
      throw new BadValuesError("comment or post must be non-empty!");
    }
  }

  async removeDownvote(user: ObjectId, comment?: ObjectId, post?: ObjectId) {
    if (comment && post) {
      throw new BadValuesError("Can't vote for both at the same time!");
    } else if (comment) {
      let downvoteComment = await this.votes.readOne({ comment });
      if (!downvoteComment) {
        throw new NotFoundError("Parent Comment not found!");
      } else if (!downvoteComment.downvotes || downvoteComment.downvotes === 0) {
        throw new NotFoundError("No downvotes found!");
      } else {
        downvoteComment.downvotes--;
        await this.removeUser(downvoteComment._id, user);
        await this.votes.updateOne({ comment }, downvoteComment);
        return { msg: "Removed comment downvote!", downvote: await this.votes.readOne({ comment }) };
      }
    } else if (post) {
      let downvotePost = await this.votes.readOne({ post });
      if (!downvotePost) {
        throw new NotFoundError("Parent Post not found!");
      } else if (!downvotePost.downvotes || downvotePost.downvotes === 0) {
        throw new NotFoundError("No downvotes found!");
      } else {
        downvotePost.downvotes--;
        await this.removeUser(downvotePost._id, user);
        await this.votes.updateOne({ post }, downvotePost);
        return { msg: "Removed comment downvote!", downvote: await this.votes.readOne({ post }) };
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

  async deleteAll() {
    const votes = await this.votes.deleteMany({});
    return votes;
  }
}
