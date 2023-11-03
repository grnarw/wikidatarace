import {Game} from "./game.model";
import {DifficultyConstant} from "../constant/difficulty.constant";

export class User {
  username = "";
  lastDifficulty = DifficultyConstant.DEFAULT;
  games: Game[] = [];

  constructor(username: string, lastDifficulty: number, games: Game[]) {
    this.username = username;
    this.lastDifficulty = lastDifficulty;
    this.games = games;
  }

}
