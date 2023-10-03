import CategoryConcept from "./concepts/category";
import CommentConcept from "./concepts/comment";
import FriendConcept from "./concepts/friend";
import PostConcept from "./concepts/post";
import SpotInfoConcept from "./concepts/spotinfo";
import SpotLiteConcept from "./concepts/spotlite";
import UserConcept from "./concepts/user";
import VoteConcept from "./concepts/vote";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Post = new PostConcept();
export const Friend = new FriendConcept();
export const Comment = new CommentConcept();
export const Vote = new VoteConcept();
export const SpotLite = new SpotLiteConcept();
export const Category = new CategoryConcept();
export const SpotInfo = new SpotInfoConcept();
