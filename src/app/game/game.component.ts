import {Component, OnDestroy, OnInit} from '@angular/core';
import {GameService} from "../shared/service/game.service";
import {Game} from "../shared/model/game.model";
import {DifficultyConstant} from "../shared/constant/difficulty.constant";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {

  loaderWidth = '0';
  step = '';
  game = new Game(DifficultyConstant.DEFAULT);

  private subscriptions: Subscription[] = [];

  constructor(private gameService: GameService,
              private router: Router) {
    // récupère le dernier jeu de l'utilisateur courant
    this.gameService.updateWithLocalGame();
    const sub = this.gameService.getGame().subscribe({
      next: (game) => {
        this.game = game;
      }
    });
    this.subscriptions.push(sub);
  }

  ngOnInit() {
    if( this.game == undefined ) {
      this.router.navigate(['/home']).then(() => {});
    }else {
      if ( this.game.bestPath.length == 0 ) {
        this.initNewGame().then(() => {});
      }else{
        this.initResumeGame().then(() => {});
      }
    }
  }

  /**
   * Initialise une nouvelle partie
   */
  async initNewGame() {

    this.step = "Initialisation du point de départ";
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.loaderWidth = '25%';
    this.gameService.initStartingPoint();

    this.step = "Initialisation du point d'arrivée";
    await this.gameService.initBestPath();
    this.loaderWidth = '75%';

    this.step = "Préparation de la page";
    await this.gameService.initNewPage();
    this.loaderWidth = '100%';
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.gameService.updateStatus("in-progress");
  }

  /**
   * Initialise la reprise d'une partie en cours
   */
  async initResumeGame() {
    this.step = "préparation de la page"
    await this.gameService.initPage();
    this.step = "prêt";
  }

  /**
   * Abandonne la partie en cours
   */
  giveup() {
    this.gameService.giveup();
    this.router.navigate(['/home']).then(() => {});
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
