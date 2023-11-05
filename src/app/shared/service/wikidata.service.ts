import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WikidataService {
  private endpoint: string = 'https://query.wikidata.org/sparql';

  constructor(private http: HttpClient) {
  }

  /**
   * Permet de récupérer le label d'un sujet
   * (exemple : Q90 -> Paris)
   * @param subjectId
   */
  async getSubjectLabel(subjectId: string): Promise<string> {
    let sparqlQuery = `
      SELECT ?subjectLabel
      WHERE {
        wd:${subjectId} rdfs:label ?subjectLabel.
        FILTER(LANG(?subjectLabel) = "fr").
      }
    `;
    const response = await this.executeSparqlQuery(sparqlQuery).toPromise();
    return response.results.bindings[0].subjectLabel.value;
  }

  /**
   * Permet de récupérer les propriétés d'un sujet
   * (exemple : Q90 :
   *          P31 -> Q5119 -> capitale
   *          P17	-> Q142 -> France)
   * @param subjectId
   */
  async getSubjectProperties(subjectId: string): Promise<[]> {
    let sparqlQuery = `
      SELECT ?property ?value ?valueLabel
      WHERE {
        wd:${subjectId} ?property ?value.
        SERVICE wikibase:label {
          bd:serviceParam wikibase:language "fr".
          ?value rdfs:label ?valueLabel.
        }
        FILTER(LANG(?valueLabel) = "fr").
      }
    `;
    const response = await this.executeSparqlQuery(sparqlQuery).toPromise();
    return response.results.bindings;
  }

  public executeSparqlQuery(query: string): Observable<any> {
    const headers = new HttpHeaders({
      'Accept': 'application/sparql-results+json'
    });

    return this.http.get(this.endpoint, {
      headers: headers,
      params: {query: query}
    });
  }
}
