import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";

export interface SpotliteDoc extends BaseDoc {
  cycleDays: number;
  spotliter: ObjectId;
}

export default class SpotliteConcept {
  public readonly spotlites = new DocCollection<SpotliteDoc>("spotlites");

  async createSpotliters(pool: ObjectId[]) {
    let spotLiters = [];
    let cycleDays = 0;

    const totalUsers = pool.length;

    const hasSpotliters = await this.getSpotliters();
    if (hasSpotliters.length >= 4) {
      throw new NotAllowedError(`Spotliters already exist!`);
    }

    if (totalUsers < 5) {
      throw new Error("Insufficient users in the pool.");
    }

    const randomIndices = await this.getRandomIndices(totalUsers, 5);

    for (const index of randomIndices) {
      const selectedUser = pool[index];

      const _id = await this.spotlites.createOne({ cycleDays, spotliter: selectedUser });
      spotLiters.push(_id);
    }

    return { msg: "New SpotLiters successfully selected!", SpotLiters: await this.spotlites.readMany({}) };
  }

  async getRandomIndices(total: number, count: number) {
    const indices: number[] = [];
    const uniqueIndices: Set<number> = new Set();

    while (uniqueIndices.size < count) {
      const randomIndex = Math.floor(Math.random() * total);
      if (!uniqueIndices.has(randomIndex)) {
        uniqueIndices.add(randomIndex);
        indices.push(randomIndex);
      }
    }

    return indices;
  }

  async getSpotliters() {
    return await this.spotlites.readMany({});
  }

  async resetSpotliters(pool: ObjectId[]) {
    const hasSpotliters = await this.getSpotliters();

    if (!hasSpotliters) {
      throw new NotAllowedError(`Cannot update Spotliters if none exist first`);
    } else {
      await this.spotlites.deleteMany({});
      return await this.createSpotliters(pool);
    }
  }

  async incrementCycleDays(pool: ObjectId[]) {
    const spotliters = await this.spotlites.readMany({});

    const cycleDaysArray = spotliters.map((spotliter) => spotliter.cycleDays);

    if (cycleDaysArray[0] < 8) {
      for (const spotliter of spotliters) {
        const updatedCycleDays = spotliter.cycleDays + 1;
        await this.spotlites.updateOne({ _id: spotliter._id }, { cycleDays: updatedCycleDays });
      }
      return { msg: "CycleDays updated for all spotliters!", cycleDays: await this.spotlites.readMany({}) };
    } else {
      await this.resetSpotliters(pool);
      return { msg: "New Cycle!" };
    }
  }
}
