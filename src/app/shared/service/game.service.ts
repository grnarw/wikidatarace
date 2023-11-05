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

    for(let i = 0; i < difficulty; i++) {

      // récupère les propriétés de l'élément courant (sans doublons)
      let properties = await this.wikidataService.getSubjectProperties(departureSubject);
      properties = this.getAcceptableProperties(properties);

      // récupère une propriété aléatoire
      let value: string = properties[Math.floor(Math.random() * properties.length)]['value']['value'];
      arrivalSubject = value.replace("http://www.wikidata.org/entity/", "");

      // création d'un nouveau mouvement
      let currentMove = new Move();
      currentMove.departure = new Element(departureSubject, "", "");
      currentMove.arrival = new Element(arrivalSubject, "", "");
      game.bestPath.push(currentMove);

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

    // récupère les propriétés de l'élément courant (sans doublons)
    let properties = await this.wikidataService.getSubjectProperties(currentSubject);
    properties = this.getAcceptableProperties(properties);

    // ajoute les propriétés à l'élément courant
    properties.forEach((elm: any) => {
      currentMove.departure.elements.push(
        new Element(elm.property.value.replace("http://www.wikidata.org/prop/direct/", ""),
          elm.value.value.replace("http://www.wikidata.org/entity/", ""),
          elm.valueLabel.value)
      );
    });

    // recupère le label de la dernière page (cible)
    game.bestPath[game.bestPath.length - 1].arrival.subjectLabel = await this.wikidataService.getSubjectLabel(game.bestPath[game.bestPath.length - 1].arrival.subject);

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
      this.wikidataService.getSubjectLabel(elm.subject).then((label) => {
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
   * Permet de sauvegarder le jeu courant
   */
  saveGame(game: Game) {
    // met à jour le jeu courant
    this.gameBehaviorSubject.next(game);
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
   * Termine la partie en cours (victoire)
   */
  win() {
    // récupère le jeu courant
    let game = this.gameBehaviorSubject.getValue();

    // met à jour le jeu courant
    game.result = "Gagné";
    game.status = "finished";
    game.score = game.difficulty * 1000 - ( game.duration/2 * game.userPath.length );
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

  /**
   * Permet de récupérer les propriétés acceptables
   * (dont la propriété n'a pas plus de 4 valeurs)
   */
  getAcceptableProperties(properties: []) {
    // compte le nombre de fois qu'une propriété est présente
    let countProperties = properties.reduce((acc: any, elm: any) => {
      acc[elm.property.value] = (acc[elm.property.value] || 0) + 1;
      return acc;
    }, {});

    // filtre les propriétés qui sont présentes plus de 4 fois
    countProperties = Object.keys(countProperties).filter((key: any) => countProperties[key] > 4);

    // supprime les propriétés qui sont présentes plus de 4 fois
    countProperties.forEach((elm: string) => {
      for (let i = properties.length - 1; i >= 0; i--) {
        if (properties[i]['property']['value'] == (elm)) { // Condition pour supprimer l'élément
          properties.splice(i, 1);
        }
      }
    });

    return properties;
  }

  /**
   * Permet de naviguer vers une autre page
   * @param predicat
   */
  navigateTo(predicat: string) {
    // récupère le jeu courant
    let game = this.gameBehaviorSubject.getValue();

    // récupère l'élément courant
    let currentMove = game.userPath[game.userPath.length - 1];

    // vérifie si l'élément courant contient le predicat
    let element = currentMove.departure.elements.find((elm: Element) => {
      return elm.predicate === predicat;
    });

    if(!element){
      alert("Vous ne pouvez pas naviguer vers cette page");
      return;
    }

    // met à jour l'arrivée du mouvement courant
    currentMove.arrival.subject = element.predicate;
    currentMove.arrival.subjectLabel = element.object;

    // création d'un nouveau mouvement
    let newMove = new Move();
    newMove.departure = new Element(element.predicate, "", "");
    newMove.departure.subjectLabel = element.object;
    game.userPath.push(newMove);

    // met à jour le jeu courant
    this.gameBehaviorSubject.next(game);
  }


  /**
   * Permet de savoir si on peut revenir en arrière
   * @return boolean
   */
  canBackstep() {
    // récupère le jeu courant
    let game = this.gameBehaviorSubject.getValue();
    // récupère l'élément précédent (qui n'est pas un retour en arrière)
    let previousMove = new Move();
    for(let i = game.userPath.length - 2; i >= 0; i--){
      if(!game.userPath[i].backstep && !game.userPath[i].backsteped){
        previousMove = game.userPath[i];
        break;
      }
    }
    return previousMove.departure.subject != '';
  }

  /**
   * Permet de revenir en arrière
   */
  backstep() {
    // récupère le jeu courant
    let game = this.gameBehaviorSubject.getValue();

    // récupère l'élément courant
    let currentMove = game.userPath[game.userPath.length - 1];
    // récupère l'élément précédent (qui n'est pas un retour en arrière)
    let previousMove = new Move();
    for(let i = game.userPath.length - 2; i >= 0; i--){
      if(!game.userPath[i].backstep && !game.userPath[i].backsteped){
        previousMove = game.userPath[i];
        break;
      }
    }

    // met à jour le mouvement courant
    previousMove.backsteped = true;
    currentMove.arrival.subject = previousMove.departure.subject;
    currentMove.arrival.subjectLabel = previousMove.departure.subjectLabel;
    currentMove.backstep = true;

    // création d'un nouveau mouvement
    let newMove = new Move();
    newMove.departure = new Element(previousMove.departure.subject, "", "");
    newMove.departure.subjectLabel = previousMove.departure.subjectLabel;
    game.userPath.push(newMove);

    console.log(newMove);

    // met à jour le jeu courant
    this.gameBehaviorSubject.next(game);
  }

  /**
   * Permet au joueur d'obtenir le prochain indice
   * (prochain déplacement du chemin de l'ordinateur)
   * @return void
   */
  async useHint() {
    let game = this.gameBehaviorSubject.getValue();
    if (game.hints > 0) {
      // récupère le prochain déplacement du chemin de l'ordinateur
      let nextMove = game.bestPath[game.maxHints-game.hints];

      //met à jour les labels des sujets
      nextMove.departure.subjectLabel = await this.wikidataService.getSubjectLabel(nextMove.departure.subject);
      nextMove.arrival.subjectLabel = await this.wikidataService.getSubjectLabel(nextMove.arrival.subject);

      // met à jour le jeu courant
      game.score -= 500;
      game.hints--;
      this.gameBehaviorSubject.next(game);
      return nextMove;
    }
    return;
  }

  getUsername(){
    return this.user.username;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
