import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";

export interface SpotInfoDoc extends BaseDoc {
  intro: string;
  closing: string;
  spotliter: ObjectId;
}

export default class SpotInfoConcept {
  public readonly spotInfos = new DocCollection<SpotInfoDoc>("spotInfos");

  async createSpotInfo(spotliters: ObjectId[], intros: string[], closings: string[]) {
    let spotInfoCards = [];

    const totalCount = spotliters.length;

    const hasSpotliters = await this.spotInfos.readMany({});
    if (hasSpotliters) {
      await this.spotInfos.deleteMany({});
    }

    for (let index = 0; index < 5; index++) {
      const userId = spotliters[index];
      const bio = intros[index];
      const social = closings[index];

      const spotInfoCard = await this.spotInfos.createOne({ intro: bio, closing: social, spotliter: userId });
      spotInfoCards.push(spotInfoCard);
    }

    return { msg: "SpotLiter Info cards created!", SpotLiters: await this.spotInfos.readMany({}) };
  }

  async getIntros() {
    const hasSpotInfo = await this.spotInfos.readMany({});
    if (!hasSpotInfo) {
      throw new NotAllowedError(`Cannot get intros if none exist first`);
    } else {
      const spotInfos = await this.spotInfos.readMany({});
      return { msg: "Got Info cards:", InfoCards: spotInfos.map((spotInfo) => spotInfo.intro) };
    }
  }

  async getClosings() {
    const hasSpotInfo = await this.spotInfos.readMany({});
    if (!hasSpotInfo) {
      throw new NotAllowedError(`Cannot get closings if none exist first`);
    } else {
      const spotInfos = await this.spotInfos.readMany({});
      return { msg: "Got closing cards:", ClosingCards: spotInfos.map((spotInfo) => spotInfo.closing) };
    }
  }
}
