function(doc) {
  if (doc.type == "utilisateur") {
    emit(doc.id, doc);
  }
}