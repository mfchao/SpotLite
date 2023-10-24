import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Comment, Friend, Post, SpotInfo, Spotlite, User, Vote, WebSession } from "./app";
import { CommentDoc } from "./concepts/comment";
import { PostDoc, PostOptions } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers(username: string) {
    return await User.getUsers(username);
  }

  @Router.get("/users/:spotLiteOption")
  async getSpotLitePool() {
    return await User.getSpotLitePool();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string, spotLiteOption: string, bio: string, socials: string, anonymousMode: boolean, photo: string) {
    WebSession.isLoggedOut(session);
    return await User.create(username, password, spotLiteOption, bio, socials, anonymousMode, photo);
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
    } else {
      posts = await Post.getPosts({});
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, content: string, options?: PostOptions) {
    const user = WebSession.getUser(session);
    const created = await Post.create(user, content, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return await Post.update(_id, update);
  }

  @Router.get("/posts/:_id")
  async getPostByID(_id: ObjectId) {
    return await Post.getById(_id);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return Post.delete(_id);
  }

  @Router.delete("/posts/")
  async deleteAll() {
    return await Post.deleteAll();
  }

  @Router.delete("/votes/")
  async deleteVotes() {
    return await Vote.deleteAll();
  }

  @Router.delete("/spotinfo/")
  async deleteSpots() {
    return await SpotInfo.deleteAll();
  }

  @Router.get("/friends")
  async getFriends(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.idsToUsernames(await Friend.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: WebSessionDoc, friend: string) {
    const user = WebSession.getUser(session);
    const friendId = (await User.getUserByUsername(friend))._id;
    return await Friend.removeFriend(user, friendId);
  }

  @Router.get("/friend/requests")
  async getRequests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Responses.friendRequests(await Friend.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.sendRequest(user, toId);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.removeRequest(user, toId);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.acceptRequest(fromId, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.rejectRequest(fromId, user);
  }

  @Router.post("/comments")
  async createComment(session: WebSessionDoc, post: ObjectId, content: string, parent?: ObjectId) {
    const user = WebSession.getUser(session);
    const postExists = await Post.doesPostExist(post);
    return await Comment.create(user, postExists, content, parent);
  }

  @Router.delete("/comments/:_id")
  async deleteComment(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Comment.isAuthor(user, _id);
    return Comment.delete(_id);
  }

  @Router.get("/comments")
  async getComments(post?: ObjectId) {
    let comments;
    if (post) {
      const id = await Post.doesPostExist(post);
      comments = await Comment.getByPost(id);
    } else {
      comments = await Comment.getComments({});
    }
    return comments;
  }

  @Router.get("/comments/:_id")
  async getChildrenComments(_id: ObjectId) {
    return await Comment.getChildrenComments(_id);
  }

  @Router.patch("/comments/:_id")
  async updateComment(session: WebSessionDoc, _id: ObjectId, update: Partial<CommentDoc>) {
    const user = WebSession.getUser(session);
    await Comment.isAuthor(user, _id);
    return await Comment.update(_id, update);
  }

  @Router.post("/votes/upvote")
  async upVote(session: WebSessionDoc, comment?: ObjectId, post?: ObjectId) {
    const user = WebSession.getUser(session);
    if (comment) {
      await Comment.getComment(comment);
      return await Vote.upVote(user, comment, post);
    } else if (post) {
      await Post.doesPostExist(post);
      return await Vote.upVote(user, comment, post);
    }
  }

  @Router.patch("/votes/upvote")
  async removeUpvote(session: WebSessionDoc, comment?: ObjectId, post?: ObjectId) {
    const user = WebSession.getUser(session);
    if (comment) {
      await Comment.getComment(comment);
      return await Vote.removeUpvote(user, comment, post);
    } else if (post) {
      await Post.doesPostExist(post);
      return await Vote.removeUpvote(user, comment, post);
    }
  }

  @Router.patch("/votes/downvote")
  async removeDownvote(session: WebSessionDoc, comment?: ObjectId, post?: ObjectId) {
    const user = WebSession.getUser(session);
    if (comment) {
      await Comment.getComment(comment);
      return await Vote.removeDownvote(user, comment, post);
    } else if (post) {
      await Post.doesPostExist(post);
      return await Vote.removeDownvote(user, comment, post);
    }
  }

  @Router.post("/votes/downvote")
  async downVote(session: WebSessionDoc, comment?: ObjectId, post?: ObjectId) {
    const user = WebSession.getUser(session);
    if (comment) {
      await Comment.getComment(comment);
      return await Vote.downVote(user, comment, post);
    } else if (post) {
      await Post.doesPostExist(post);
      return await Vote.downVote(user, comment, post);
    }
  }

  @Router.get("/votes")
  async getVotes(comment?: ObjectId, post?: ObjectId) {
    if (comment) {
      return await Vote.getbyComment(comment);
    } else if (post) {
      return await Vote.getbyPost(post);
    } else {
      return await Vote.getVotes({});
    }
  }

  @Router.post("/spotlites")
  async createSpotliters() {
    let pool = await User.getSpotLitePool();
    const spotLiterIds = pool.map((spotliter) => spotliter._id);
    return await Spotlite.createSpotliters(spotLiterIds);
  }

  @Router.get("/spotlites")
  async getSpotliters() {
    return await Spotlite.getSpotliters();
  }

  @Router.patch("/spotlites")
  async resetSpotliters() {
    let pool = await User.getSpotLitePool();
    const spotLiterIds = pool.map((spotliter) => spotliter._id);
    return await Spotlite.resetSpotliters(spotLiterIds);
  }

  @Router.patch("/spotlites/cycle")
  async incrementCycleDays() {
    let pool = await User.getSpotLitePool();
    const spotLiterIds = pool.map((spotliter) => spotliter._id);
    return await Spotlite.incrementCycleDays(spotLiterIds);
  }

  @Router.post("/spotinfo")
  async createSpotInfo() {
    let spotliters = await Spotlite.getSpotliters();
    let spotliterIDs = spotliters.map((spotliter) => spotliter.spotliter);
    const spotliterUsers = await User.getSpotLiteIDs(spotliterIDs);
    const spotLiterBios = spotliterUsers.map((user) => user.bio);
    const spotLiterSocials = spotliterUsers.map((user) => user.socials);
    return await SpotInfo.createSpotInfo(spotliterIDs, spotLiterBios, spotLiterSocials);
  }
  @Router.get("/spotinfo/intro")
  async getInfo() {
    return await SpotInfo.getIntros();
  }
  @Router.get("/spotinfo/closing")
  async getClosing() {
    return await SpotInfo.getClosings();
  }
}

export default getExpressRouter(new Routes());
