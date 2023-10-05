import DocCollection, { BaseDoc } from "../framework/doc";

export interface CategoryDoc extends BaseDoc {
  category: string;
}

export default class CategoryConcept {
  public readonly categories = new DocCollection<CategoryDoc>("categories");

  //create category

  //update category

  //remove category

  //filter posts by category
}
