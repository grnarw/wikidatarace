import {Component, HostListener} from '@angular/core';
import {AudioService} from "./shared/service/audio.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private audioService: AudioService) {
  }

  @HostListener('document:click', ['$event'])
  public handleClick(): void {
    this.audioService.play();
  }

}
