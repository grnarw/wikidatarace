import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from "../shared/service/user.service";
import {User} from "../shared/model/user.model";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";
import {DifficultyConstant} from "../shared/constant/difficulty.constant";
import {Game} from "../shared/model/game.model";
import {AudioService} from "../shared/service/audio.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  user = new User("", DifficultyConstant.DEFAULT, []);

  private subscriptions: Subscription[] = [];

  constructor(private userService: UserService,
              private audioService: AudioService,
              private router: Router) {
  }

  ngOnInit() {
    // s'abonne à l'utilisateur courant
    const sub = this.userService.getUser().subscribe(user => {
      this.user = user;
      if (this.user.games.length != 0 && !this.user.games[this.user.games.length - 1].result) {
        this.resumeGame();
      }
    });
    this.subscriptions.push(sub);
  }

  /**
   * Met à jour l'utilisateur courant
   * (appelé lors de la modification du nom d'utilisateur)
   * @param username - nouveau nom d'utilisateur
   */
  updateUsername(username: string) {
    this.user.username = username;
    this.userService.updateUser(this.user);
  }

  /**
   * Met à jour la difficulté de l'utilisateur courant
   * (appelé lors de la modification de la difficulté)
   * @param difficulty - nouvelle difficulté
   */
  updateDifficulty(difficulty: number) {
    this.audioService.playButtonSound();
    this.user.lastDifficulty = difficulty;
    this.userService.updateUser(this.user);
  }

  /**
   * Crée une nouvelle partie
   * (appelé lors du clic sur le bouton "Nouvelle partie")
   */
  newGame() {
    this.audioService.playButtonSound();
    this.user.games.push(new Game(this.user.lastDifficulty));
    this.userService.updateUser(this.user);
    this.router.navigate(['/game']).then();
  }

  /**
   * Reprend la partie en cours
   */
  resumeGame() {
    this.router.navigate(['/game']).then();
  }

  /**
   * Change le volume
   */
  updateVolume(vol: number) {
    this.audioService.updateVolume(vol / 10 / 2);
  }

  /**
   * Récupère le volume
   */
  getVolume() {
    return this.audioService.getVolume() * 10 * 2;
  }

  /**
   * Désactive le son
   */
  mute() {
    this.audioService.mute();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
