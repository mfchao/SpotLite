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

  // get spotliters (current selection)

  // reset spotliters  (new selection)

  // get pool of spotliters

  // set theme

  // update theme

  // start spotlite cycle

  // get spotlite cycle

  // reset spotlite cycle
}
