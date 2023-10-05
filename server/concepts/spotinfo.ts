import DocCollection, { BaseDoc } from "../framework/doc";

export interface SpotInfoDoc extends BaseDoc {
  intro: string;
  closing: string;
}

export default class SpotInfoConcept {
  public readonly spotInfos = new DocCollection<SpotInfoDoc>("spotInfos");

  //get intro for selected spotliters

  //get closing for selected spotliters
}
