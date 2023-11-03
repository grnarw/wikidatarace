import {DifficultyConstant} from "../constant/difficulty.constant";
import {Move} from "./move.model";

export class Game {
  status = "loading";
  start = new Date();
  end: Date | undefined = undefined;
  difficulty = DifficultyConstant.DEFAULT;
  duration = 0.00;
  score = 0;
  result = "";

  userPath: Move[] = [];
  bestPath: Move[] = [];

  constructor(difficulty: number) {
    this.difficulty = difficulty;
  }
}
