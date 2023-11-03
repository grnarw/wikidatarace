import {Injectable, OnDestroy} from "@angular/core";
import {Game} from "../model/game.model";
import {UserService} from "./user.service";
import {User} from "../model/user.model";
import {DifficultyConstant} from "../constant/difficulty.constant";
import {BehaviorSubject, Subscription} from "rxjs";
import {WikidataService} from "./wikidata.service";
import {Element} from "../model/element.model";
import {Move} from "../model/move.model";

@Injectable({
  providedIn: 'root'
})
export class GameService implements OnDestroy {

  private user = new User("", DifficultyConstant.DEFAULT, [])
  private gameBehaviorSubject = new BehaviorSubject<Game>(new Game(DifficultyConstant.DEFAULT));

  private subscriptions: Subscription[] = [];

  constructor(private userService: UserService,
              private wikidataService: WikidataService) {
    // récupère l'utilisateur courant
    const sub = this.userService.getUser().subscribe({
      next: (user) => {
        this.user = user;
      }
    });
    this.subscriptions.push(sub);
  }

  /**
   * Retourne le jeu courant
   */
  getGame(): BehaviorSubject<Game> {
    return this.gameBehaviorSubject;
  }

  /**
   * Récupère le dernier jeu de l'utilisateur courant
   * @return Game
   */
  updateWithLocalGame() {
    // mapping du dernier jeu de l'utilisateur courant
    const gametmp = this.user.games[this.user.games.length - 1];

    let game = new Game(gametmp.difficulty);
    game.start = gametmp.start;
    game.end = gametmp.end;
    game.time = gametmp.time;
    game.score = gametmp.score;
    game.result = gametmp.result;
    game.userPath = gametmp.userPath;
    game.bestPath = gametmp.bestPath;

    // met à jour le jeu courant
    this.gameBehaviorSubject.next(game);
  }

  /**
   * Initialise le point de départ du jeu
   * @return void
   */
  initStartingPoint() {
    // récupère un point de départ aléatoire
    let elm = new Element("Q" + Math.floor(Math.random() * 100000), "", "");

    // ajoute le point de départ au jeu
    let move = new Move();
    move.departure = elm;
    let game = this.gameBehaviorSubject.getValue();
    game.bestPath.push(move);
    this.gameBehaviorSubject.next(game);
  }

  /**
   * Initialise le meilleur chemin du jeu (chemin de l'ordinateur)
   * @return void
   */
  async initBestPath() {
    // récupère le jeu courant
    let game = this.gameBehaviorSubject.getValue();
    let difficulty = game.difficulty;

    // récupère le point de départ
    let departureSubject = game.bestPath[0].departure.subject;
    let arrivalSubject = game.bestPath[0].arrival.subject;

    //vide le tableau
    game.bestPath.pop();
    console.log("tab vide : ", game.bestPath);

    for(let i = 0; i < difficulty; i++) {
      console.log("i = " + i);
      console.log(departureSubject);

      const properties = await this.wikidataService.getSubjectProperties(departureSubject);
      // récupère une propriété aléatoire
      let value: string = properties[Math.floor(Math.random() * properties.length)]['value']['value'];
      arrivalSubject = value.replace("http://www.wikidata.org/entity/", "");

      // création d'un nouveau mouvement
      let currentMove = new Move();
      currentMove.departure = new Element(departureSubject, "", "");
      currentMove.arrival = new Element(arrivalSubject, "", "");
      console.log("currentMove : ", currentMove);
      game.bestPath.push(currentMove);
      console.log("tab : " + game.bestPath);

      departureSubject = arrivalSubject;
    }
  }





  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

}
