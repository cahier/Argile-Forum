/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

//Enregistrement d'un nouveau compte'
function enregistrer(login,mdp,email){
    
    db = $.couch.db("argile-forum");
    
    var laDate = new Date();
    
    db.saveDoc(
        {
            type : "utilisateur", 
            nom_utilisateur : login,
            mot_de_passe : mdp,
            email : email,
            created : laDate.toString()
        },
        {success: function(data){
            //alert("enregistr√©");
            connecter(login,mdp);
        }}
    );
}

//Connexion de l'utilisateur, cookie créé'
function connecter(login,mdp){
    
    //alert("connecter");
    
    db = $.couch.db("argile-forum");
    db.view("argile-forum/utilisateurs", {
        success: function(data) {
            for(i in data.rows){
                if((data.rows[i].value.nom_utilisateur == login)&&(data.rows[i].value.mot_de_passe == mdp)){
                    var today = new Date(), expires = new Date();
                    expires.setTime(today.getTime() + (365*24*60*60*1000));
                    document.cookie = "login" + "=" + encodeURIComponent(login) + ";expires=" + expires.toGMTString();
                    
                    //alert("connect√©");
                    
                    window.location.reload();
                }
                else{
                    //alert("erreur if");
                }
            }
        },
        error: function(status){
            //alert("erreur");
        }
    });    
}

//Vérifier via les cookies si la personne est connectée.
//Renvoie le nom de l'utilisateur connecté ou rien'
function verifierConnexion(){
    
   var oRegex = new RegExp("(?:; )?" + login + "=([^;]*);?");
 
    if (oRegex.test(document.cookie)) {
            return decodeURIComponent(RegExp["$1"]);
    } else {
            return null;
    } 
}

//Déconnection de l'utilisateur.
//Valeur dans le cookie modifié pour expirer direct.
function deconnecter(){
    var cookie_date = new Date ( );  // current date & time
    cookie_date.setTime ( cookie_date.getTime() - 1 );
    document.cookie = "login" + "=; expires=" + cookie_date.toGMTString();
    
    window.location.reload();
}

//Créer une nouvelle conversation
function nouvelleConversation(auteur,titre,texte,type,lien,titres){
    
    db = $.couch.db("argile-forum");
    
    var reload = false;
    
    if(lien==null){
        var titres = ['Racine'];
        var lien = ['Racine'];
        
        reload = true;
    }
    
    var laDate = new Date();
    
    db.saveDoc(
        {
            type : "topic", 
            created: laDate.toString(),
            modified: laDate.toString(),
            title: titre, 
            text: texte,
            type_objet: type,
            answered:"no",
            linked_to:lien,
            relinked_to:titres,
            auteur: auteur
        },
        {
            success: function(){
                if(reload==true){
                    window.location.reload();
                    //MODIFICATION A FAIRE : rediriger vers la page créée
                }
            }
        }
    );
}

//Ajouter un nouveau commentaire lié à la conversation
function nouveauCommentaire(auteur,id,name,text){
    
    db = $.couch.db("argile-forum");
    
    var laDate = new Date();
    
    db.saveDoc(
        {
            type : "comment", 
            created: laDate.toString(),
            topic_id: id,
            topic_name: name,
            text: text,
            vote_count: 0,
            auteur: auteur
        },
        {success: function(){
            window.location.reload();
        }}
    );
        
    db.openDoc(id, {
        success: function(doc) {
            doc.modified=laDate.toString();
            db.saveDoc(doc, {
                success: function() {
                    document.location.reload(true);
                }});
        }
    });
}

//Valider un commentaire
function valider(topic_id,id){

    var top_id=topic_id;

    db = $.couch.db("argile-forum");
    db.openDoc(top_id, {
        success: function(doc) {
            doc.answered=id;
            db.saveDoc(doc, {
                success: function() {
                    document.location.reload(true);
                }});
        }
    });
}

//Invalider un commentaire
function invalider(topic_id){
    
    var top_id=topic_id;

    db = $.couch.db("argile-forum");
    db.openDoc(top_id, {
        success: function(doc) {
            doc.answered="no";
            db.saveDoc(doc, {
                success: function() {
                    document.location.reload(true);
                }});
        }
    });
}

//Récupérer les discussions liées à celle affichée
function enRelation(liens){
    
    var retour = "test";
    db = $.couch.db("argile-forum");
    db.view("argile-forum/discussions", {
        success: function(data) {
            for(i in data.rows){
                //Comparaison des liens
                if(data.rows[i].value.linked_to == liens){
                    retour = retour+", "+data.rows[i].value.title;
                }
            }
            alert("fin : "+retour);
        }
    });
    return retour;
}



//Afficher le nom d'utilisateur et le lien de deconnexion
//A exécuter dès le chargement de la page
$("#ident").ready(function(){
    var connecte ="rien";
    connecte = verifierConnexion();
    //alert(connecte);
    if(connecte!=null){
        $("#ident").html(connecte + ' - <a href="#" onclick="deconnecter()">Deconnexion</a>');
    }
});

//TEST REQUETE POST
/*var data = {
        type: "post_test",
        created: a,
        text: docu.text
};
alert(JSON.stringify(data));
$.ajax({
    url: "..",
    type: "POST",
    contentType:"application/json",
    data:JSON.stringify(data),
    dataType: "json",
    success: function() {
            alert("POST Sent");
}
});
 *
 */