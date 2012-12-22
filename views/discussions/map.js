function(doc) {
  //if ((doc.type == "topic")&&(doc.linked_to == "Racine")) {
  if (doc.type == "topic") {
    emit(Date.parse(doc.modified), doc);
  }
}