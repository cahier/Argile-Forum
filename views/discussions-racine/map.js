function(doc) {
  if ((doc.type == "topic")&&(doc.parents_id == "Racine")) {
    emit(Date.parse(doc.modified), doc);
  }
}