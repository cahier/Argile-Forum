function(head, req) {
  // !json templates.commentaires
  // !code lib/mustache.js
  start({"headers":{"Content-Type":"text/html;charset=utf-8"}});
  
  //Initialisation de l'objet data, et valeurs par défaut
  var data = {
    topic: "Test",
    topic_id: "Test",
    answered: "",
    commentaires: []
  };
  var i = 0;
  
  //On récupère l'objet JSON de la requête
  while (row = getRow()) {
    //Si c'est un document topic, page de discussion
    if (i==0){
        data.topic = row.value.title;
        data.topic_id = row.value._id;
        data.topic_text = row.value.text;
        data.answered = row.value.answered;
        data.date_modification = row.value.created;
        data.linked_to = row.value.linked_to;
        data.relinked_to = row.value.relinked_to;        
        data.type_objet = row.value.type_objet;
        data.auteur = row.value.auteur;
        i++;
    }
    else{
        //On récupère les commentaires associés au fil de discussion
    	data.commentaires.push({
            order: ++i,
            id: row.id,
            text: row.value.text,
            count: row.value.vote_count,
            date_modification: row.value.created,
            auteur: row.value.auteur
    	});
        //Pour chaque commentaire récupérée, on vérifie si c'est celui validé. 
        //On récupère pour le mettre en avant
        if(row.id==data.answered){
            data.answered_text = row.value.text;
            data.answered_count = row.value.vote_count;
        }
    }
  }
  
  //On applique les valeurs à la page html commentaires
  return Mustache.to_html(templates.commentaires, data);
}