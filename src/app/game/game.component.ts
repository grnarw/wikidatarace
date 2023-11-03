import {Component, OnDestroy, OnInit} from '@angular/core';
import {GameService} from "../shared/service/game.service";
import {Game} from "../shared/model/game.model";
import {DifficultyConstant} from "../shared/constant/difficulty.constant";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {

  step = "";
  game = new Game(DifficultyConstant.DEFAULT);

  private subscriptions: Subscription[] = [];

  constructor(private gameService: GameService) {}

  ngOnInit() {
    this.initGame().then(() => {});
  }

  async initGame() {
    // récupère le dernier jeu de l'utilisateur courant
    this.gameService.updateWithLocalGame();
    const sub = this.gameService.getGame().subscribe({
      next: (game) => {
        this.game = game;
      }
    });
    this.subscriptions.push(sub);

    // préparation du jeu
    this.step = "recupération point de départ";
    this.gameService.initStartingPoint();

    console.log(this.game);


    this.step = "recupération point d'arrivée";
    await this.gameService.initBestPath();

    this.step = "préparation de la page"
  }

  // ngOnInit() {
  //   let sparqlQuery = `
  //     SELECT ?property ?value ?valueLabel
  //     WHERE {
  //       wd:Q90 ?property ?value.
  //       SERVICE wikibase:label {
  //         bd:serviceParam wikibase:language "fr".
  //         ?value rdfs:label ?valueLabel.
  //       }
  //       FILTER(LANG(?valueLabel) = "fr").
  //     } LIMIT 10
  //   `;
  //
  //   this.wikiDataService.executeSparqlQuery(sparqlQuery).subscribe({
  //     next: (response) => {
  //       response.results.bindings.forEach((elm: any) => {
  //         this.items.push(
  //           new Element(elm.property.value.replace("http://www.wikidata.org/prop/direct/", ""),
  //             elm.value.value.replace("http://www.wikidata.org/entity/", ""),
  //             elm.valueLabel.value)
  //         );
  //       });
  //
  //       // FILTER POUR NE REQUETER QUE DES PROPRIETES UNE SEULE FOIS PAS DE DOUBLONS
  //       // TODO
  //       this.items.forEach((elm: Element) => {
  //         let sparqlQuery = `
  //           SELECT ?propertyLabel WHERE {
  //              wd:${elm.subject} rdfs:label ?propertyLabel.
  //              FILTER(LANG(?propertyLabel) = "fr").
  //           }
  //         `;
  //         console.log(sparqlQuery);
  //         this.wikiDataService.executeSparqlQuery(sparqlQuery).subscribe({
  //           next: (response) => {
  //             elm.subjectLabel = response.results.bindings[0].propertyLabel.value;
  //           },
  //           error: (err) => {
  //             console.error('Error executing SPARQL query: ', err);
  //           }
  //         });
  //       });
  //
  //     },
  //     error: (err) => {
  //       console.error('Error executing SPARQL query: ', err);
  //     }
  //   });
  // }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
