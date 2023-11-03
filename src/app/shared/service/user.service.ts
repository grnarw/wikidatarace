import {Injectable} from "@angular/core";
import {User} from "../model/user.model";
import {StorageConstant} from "../constant/storage.constant";
import {BehaviorSubject} from "rxjs";
import {DifficultyConstant} from "../constant/difficulty.constant";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private user = new User("", DifficultyConstant.DEFAULT, []);
  private userBehaviour = new BehaviorSubject<User>(this.user);

  constructor() {
    this.init();
  }

  /**
   * Retourne l'utilisateur sous forme de BehaviorSubject
   * (permet de s'abonner à l'utilisateur)
   */
  getUser(): BehaviorSubject<User> {
    return this.userBehaviour;
  }

  /**
   * Met à jour l'utilisateur
   * @param user - nouvel utilisateur
   */
  updateUser(user: User) {
    this.user = user;
    this.setLocalUser(this.user);
    this.userBehaviour.next(this.user);
  }

  /**
   * Initialise le service
   * Si l'utilisateur n'existe pas dans le localStorage, on l'ajoute
   * Sinon on récupère l'utilisateur du localStorage
   * @private
   */
  private init(){
    if (this.userExist()) {
      this.user = this.getLocalUser();
    }else{
      this.setLocalUser(this.user);
    }

    this.userBehaviour.next(this.user);
  }

  /**
   * Vérifie si l'utilisateur existe dans le localStorage
   * @private
   */
  private userExist(): boolean {
    return localStorage.getItem(StorageConstant.USER) != null;
  }

  /**
   * Retourne l'utilisateur du localStorage
   * @private
   */
  private getLocalUser(): User {
    return JSON.parse(localStorage.getItem(StorageConstant.USER)!) as User;
  }

  /**
   * Met à jour l'utilisateur dans le localStorage
   * @param user - nouvel utilisateur
   * @private
   */
  private setLocalUser(user: User) {
    localStorage.setItem(StorageConstant.USER, JSON.stringify(user));
  }

}
