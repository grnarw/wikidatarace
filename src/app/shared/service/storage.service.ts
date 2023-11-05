import {Injectable} from "@angular/core";
import {StorageConstant} from "../constant/storage.constant";

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() {
  }

  /**
   * Vérifie si une clé existe dans le localStorage
   * @param key - clé à vérifier
   * @param version - version de la clé
   */
  itemExist(key: string, version: string): boolean {
    return this.getItem(key, version) != null;
  }

  /**
   * Enregistre une valeur dans le localStorage
   * @param key - clé
   * @param value - valeur
   * @param version - version de la clé
   */
  setItem(key: string, value: any, version: string) {
    //crée un objet custom avec un champs version en plus
    let customObject = {
      version: version,
      value: value
    }

    if (StorageConstant.ENCODE) {
      localStorage.setItem(key, btoa(JSON.stringify(customObject)));
    } else {
      localStorage.setItem(key, JSON.stringify(customObject));
    }
  }

  /**
   * Récupère une valeur du localStorage en fonction de la version
   * @param key - clé
   * @param version - version de la clé
   */
  getItem(key: string, version: string): any {
    //récupère l'objet custom du localStorage
    let strObject = localStorage.getItem(key)!;
    if (strObject == null ) {
      return null;
    }

    // décode l'objet si besoin
    if ( this.isBase64(strObject) ) {
      strObject = atob(strObject);
    }

    let customObject = JSON.parse(strObject);

    if (customObject.version == null || customObject.value == null || customObject.version != version) {
      return null;
    }

    return customObject.value;
  }

  /**
   * Permet de vériier si la chaine est en base64
   * @param str
   * @returns boolean
   */
  isBase64(str: string) {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  }

}
