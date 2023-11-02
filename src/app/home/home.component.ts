import {Component, OnInit} from '@angular/core';
import {WikidataService} from "../shared/service/wikidata.service";
import {Element} from "../shared/model/element.model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  items: Element[] = [];

  constructor(private wikiDataService: WikidataService) {}

  ngOnInit() {
    let sparqlQuery = `
      SELECT ?property ?value ?valueLabel
      WHERE {
        wd:Q90 ?property ?value.
        SERVICE wikibase:label {
          bd:serviceParam wikibase:language "fr".
          ?value rdfs:label ?valueLabel.
        }
        FILTER(LANG(?valueLabel) = "fr").
      } LIMIT 10
    `;

    this.wikiDataService.executeSparqlQuery(sparqlQuery).subscribe({
      next: (response) => {
        response.results.bindings.forEach((elm: any) => {
          this.items.push(
            new Element(elm.property.value.replace("http://www.wikidata.org/prop/direct/", ""),
              elm.value.value.replace("http://www.wikidata.org/entity/", ""),
              elm.valueLabel.value)
          );
        });

        // FILTER POUR NE REQUETER QUE DES PROPRIETES UNE SEULE FOIS PAS DE DOUBLONS
        this.items.forEach((elm: Element) => {
          let sparqlQuery = `
            SELECT ?propertyLabel WHERE {
               wd:${elm.subject} rdfs:label ?propertyLabel.
               FILTER(LANG(?propertyLabel) = "fr").
            }
          `;
          console.log(sparqlQuery);
          this.wikiDataService.executeSparqlQuery(sparqlQuery).subscribe({
              next: (response) => {
                elm.subjectLabel = response.results.bindings[0].propertyLabel.value;
              },
              error: (err) => {
                  console.error('Error executing SPARQL query: ', err);
              }
          });
        });

      },
      error: (err) => {
        console.error('Error executing SPARQL query: ', err);
      }
    });
  }

}
