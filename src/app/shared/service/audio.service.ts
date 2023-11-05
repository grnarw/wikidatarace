import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private buttonAudio = new Audio();

  constructor() {
    this.init();
  }

  private init() {
    this.buttonAudio.src = 'assets/audio/button-audio.mp3';
    this.buttonAudio.load();

    this.buttonAudio.volume = .5;
  }

  /**
   * Joue le son du bouton
   */
  playButtonSound() {
    this.buttonAudio.play().then(() => {
    });
  }

}
