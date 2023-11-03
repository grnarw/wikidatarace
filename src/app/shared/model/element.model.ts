export class Element {
  constructor(subject: string, predicate: string, object: string) {
    this.subject = subject
    this.predicate = predicate
    this.object = object
  }

  subject = ""
  subjectLabel = ""
  predicate = ""
  object = ""
  elements: Element[] = []
}
