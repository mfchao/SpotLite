import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface SpotLiteDoc extends BaseDoc {
  days: Date;
  spotliters: [ObjectId];
  pool: [ObjectId];
  theme: string;
}

export default class SpotLiteConcept {
  public readonly spotLites = new DocCollection<SpotLiteDoc>("spotLites");
}
