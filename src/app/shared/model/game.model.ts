import {DifficultyConstant} from "../constant/difficulty.constant";
import {Move} from "./move.model";

export class Game {
  start = new Date();
  end: Date | undefined = undefined;
  difficulty = DifficultyConstant.DEFAULT;
  time = 0.00;
  score = 0;
  result = "";

  userPath: Move[] = [];
  bestPath: Move[] = [];

  constructor(difficulty: number) {
    this.difficulty = difficulty;
  }
}
