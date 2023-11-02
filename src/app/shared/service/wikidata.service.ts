import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WikidataService {
  private endpoint: string = 'https://query.wikidata.org/sparql';

  constructor(private http: HttpClient) {}

  public executeSparqlQuery(query: string): Observable<any> {
    const headers = new HttpHeaders({
      'Accept': 'application/sparql-results+json'
    });

    return this.http.get(this.endpoint, {
      headers: headers,
      params: { query: query }
    });
  }
}
