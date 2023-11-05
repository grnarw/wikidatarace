import {Injectable, OnDestroy} from "@angular/core";
import {UserService} from "./user.service";

@Injectable({
  providedIn: 'root'
})
export class AudioService implements OnDestroy {

  private mainAudio = new Audio();
  private buttonAudio = new Audio();

  constructor(private userService: UserService) {
    this.init();
  }

  private init() {
    this.mainAudio.src = 'assets/audio/main-audio.mp3';
    this.buttonAudio.src = 'assets/audio/button-audio.mp3';
    this.mainAudio.load();
    this.buttonAudio.load();
    this.mainAudio.loop = true;

    this.mainAudio.volume = .5;
    this.buttonAudio.volume = .5;

    const user = this.userService.getUser().getValue();
    this.updateVolume(user.audioVolume);
    this.mainAudio.muted = user.audioMuted;
  }

  /**
   * Joue le son
   */
  play() {
    this.mainAudio.play().then(() => {
    });
  }

  playButtonSound() {
    this.buttonAudio.play().then(() => {
    });
  }

  /**
   * Change le volume à la valeur définie par l'utilisateur
   * (vol = 0 -> mute)
   * (vol = 1 -> max)
   * @param vol - volume
   */
  updateVolume(vol: number) {
    if (vol >= 0 && vol <= 1) {
      this.mainAudio.volume = vol;
      this.buttonAudio.volume = vol + 0.2;
    }
    this.userService.updateVolume(vol);
  }

  /**
   * Désactive le son
   */
  mute() {
    this.mainAudio.muted = !this.mainAudio.muted;
  }

  /**
   * Retourne le volume actuel
   */
  getVolume() {
    return this.mainAudio.volume;
  }

  ngOnDestroy(): void {
    this.mainAudio.pause();
  }

}
