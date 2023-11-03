import { Element } from "./element.model";

export class Move {
  departure = new Element("", "", "");
  arrival = new Element("", "", "");
  backstep = false;
}
