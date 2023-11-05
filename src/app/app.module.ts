import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {HomeComponent} from './home/home.component';
import {HttpClientModule} from "@angular/common/http";
import {GameComponent} from './game/game.component';
import {FormsModule} from "@angular/forms";
import {RoundUpPipe} from './shared/pipe/round-up.pipe';
import {TimePipe} from "./shared/pipe/time.pipe";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    GameComponent,
    RoundUpPipe,
    TimePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
