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
    // met à jour le jeu courant
    this.gameBehaviorSubject.next(this.user.games[this.user.games.length - 1]);
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
    game.userPath.push(move);

    this.gameBehaviorSubject.next(game);
  }

  /**
   * Initialise le meilleur chemin du jeu (chemin de l'ordinateur) en fonction de la difficulté
   * Pour trouver l'élément final
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

  /**
   * Initialise la page pour l'élément courant
   * Uniquement si elle n'a pas déjà été initialisée
   */
  async initNewPage() {
    //recupère l'élément courant
    let game = this.gameBehaviorSubject.getValue();
    let currentMove = game.userPath[game.userPath.length - 1];
    let currentSubject = currentMove.departure.subject;

    //récupère le label de l'élément courant
    currentMove.departure.subjectLabel = await this.wikidataService.getSubjectLabel(currentSubject);

    // récupère les propriétés de l'élément courant
    const properties = await this.wikidataService.getSubjectProperties(currentSubject);

    // ajoute les propriétés à l'élément courant
    properties.forEach((elm: any) => {
      console.log("Ajoute de : " + elm.property.value.replace("http://www.wikidata.org/prop/direct/", "") + " à " + currentMove.departure.subject);
      currentMove.departure.elements.push(
        new Element(elm.property.value.replace("http://www.wikidata.org/prop/direct/", ""),
          elm.value.value.replace("http://www.wikidata.org/entity/", ""),
          elm.valueLabel.value)
      );
    });

    await this.initPage();
  }

  /**
   * Initialise la page pour l'élément courant
   * Uniquement si elle n'a pas déjà été initialisée
   */
  async initPage() {
    //recupère l'élément courant
    let game = this.gameBehaviorSubject.getValue();
    let currentMove = game.userPath[game.userPath.length - 1];
    let currentSubject = currentMove.departure.subject;

    //récupère le label de l'élément courant
    currentMove.departure.subjectLabel = await this.wikidataService.getSubjectLabel(currentSubject);

    //extrait les propriétés sans doublons
    let propertiesWithoutDuplicate = currentMove.departure.elements.filter((elm: Element, index: number, self: Element[]) => {
      return index === self.findIndex((t) => (
        t.subject === elm.subject
      ))
    });

    // récupère les labels de chaque propriété
    propertiesWithoutDuplicate.forEach((elm: Element) => {
      console.log(elm.subject);
      this.wikidataService.getSubjectLabel(elm.subject).then((label) => {
        console.log("Ajoute de : " + label + " à " + elm.subject);
        elm.subjectLabel = label;

        // met à jour le label de chaque propriété
        currentMove.departure.elements.forEach((elm2: Element) => {
          if(elm.subject === elm2.subject) {
            elm2.subjectLabel = label;
          }
        });
      });
    });

    // met à jour le jeu dans le cache
    this.userService.updateUser(this.user);
  }


  /**
   * Abandonne la partie en cours
   */
  giveup() {
    // récupère le jeu courant
    let game = this.gameBehaviorSubject.getValue();

    // met à jour le jeu courant
    game.result = "Abandonné";
    game.end = new Date();
    this.gameBehaviorSubject.next(game);

    // met à jour l'utilisateur
    this.userService.updateUser(this.user);
  }

  /**
   * Permet de mettre à jour le statut du jeu
   */
  updateStatus(status: string) {
    // récupère le jeu courant
    let game = this.gameBehaviorSubject.getValue();

    // met à jour le jeu courant
    game.status = status;
    this.gameBehaviorSubject.next(game);

    // met à jour l'utilisateur
    this.userService.updateUser(this.user);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

}
