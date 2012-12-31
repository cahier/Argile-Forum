/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * Enregistrement d'un nouveau compte
 * @param {string}  login   Nom du nouvel utilisateur
 * @param {string}  mdp     Mot de passe choisi
 * @param {string}  email   Email du nouvel utilisateur
 * @param {string}  role    Role du nouvel utilisateur
 */
function enregistrer(login,mdp,email,role){
    
    if(!role){
        var role = "basique";
    }
    
    db = $.couch.db("argile-forum");
    
    var laDate = new Date();
    
    db.saveDoc(
        {
            type : "utilisateur", 
            nom_utilisateur : login,
            mot_de_passe : mdp,
            email : email,
            role: role,
            created : laDate.toString()
        },
        {success: function(data){
            connecter(login,mdp);
        }}
    );
}

/*
 * Connexion de l'utilisateur, cookie créé
 * @param   {string}    login   Nom d'utilisateur renseigné
 * @param   {string}    mdp     Mot de passe renseigné
 */
function connecter(login,mdp){
    
    var reussi = false;
    
    db = $.couch.db("argile-forum");
    db.view("argile-forum/utilisateurs", {
        success: function(data) {
            for(i in data.rows){
                if((data.rows[i].value.nom_utilisateur == login)&&(data.rows[i].value.mot_de_passe == mdp)){
                    var today = new Date(), expires = new Date();
                    expires.setTime(today.getTime() + (365*24*60*60*1000));
                    document.cookie = "loginForum" + "=" + encodeURIComponent(login) + ";expires=" + expires.toGMTString() +"; path=/";
                    reussi = true;                 
                    window.location.reload();
                }
            }
            if(!reussi){
                alert("Mauvais login/mot de passe");
            }
        },
        error: function(status){
            //alert("erreur");
        } 
   });    
}

/*
*Vérifier via les cookies si la personne est connectée.
*@return {string} Renvoie le nom de l'utilisateur ou null
*/
function verifierConnexion(){
    
   //Via les expressions régulières
   var oRegex = new RegExp("(?:; )?" + "loginForum" + "=([^;]*);?");
 
    if (oRegex.test(document.cookie)) {
            return decodeURIComponent(RegExp["$1"]);
    } else {
            return null;
    }
    
    
}

/*
 * Déconnection de l'utilisateur.
 * Valeur dans le cookie modifié pour expirer directement.
 */
function deconnecter(){
    var cookie_date = new Date ( );  // current date & time
    cookie_date.setTime ( cookie_date.getTime() - 10 );
    document.cookie = "loginForum" + "=; expires=" + cookie_date.toGMTString() +"; path=/";
    
    window.location.reload();
}

/*
 * Créer une nouvelle conversation
 * @param {string}  auteur   Nom de l'auteur
 * @param {string}  titre    Titre (ou nom de l'objet) de la nouvelle discussion
 * @param {string}  texte    Texte descriptif de la discussion
 * @param {string}  type     Type de l'objet de la discussion : scene, objet, action...
 * @param {array}   lien     Tableau contenant les ID des parents de la discussion
 * @param {array}   titres   Tableau contenant les titre des parents de la discussion
 * 
 * @return {string}          Retourne l'ID de la disccusion créée
 */
function nouvelleConversation(auteur,titre,texte,type,lien,titres){
    
    db = $.couch.db("argile-forum");
    
    var reload = false;
    
    if(lien==null){
        var titres = ['Racine'];
        var lien = ['Racine'];
        
        rediriger = true;
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
            parents_id:lien,
            parents_titre:titres,
            auteur: auteur
        },
        {
            success: function(data){
                $('input#_rev').val(data.rev);
                $('form.imageForm').ajaxSubmit({
                  url: "/argile-forum/"+ data.id,
                  async: false,
                  success: function(response) {

                  }
                })
                if(rediriger==true){
                    //window.location.reload();
                    window.location = "_rewrite/discussion/" + data.id;
                }
                return data.id;
            }
        }
    );
}

/*
 * Ajouter un nouveau commentaire lié à la conversation
 * @param {string}  auteur   Nom de l'auteur
 * @param {string}  id       ID de la discussion commentée
 * @param {string}  name     Titre de la discussion commentée
 * @param {string}  text     Texte du commentaire
 */
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
            vote_negatif: 0,
            vote_positif: 0,
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

/*
* Valider un commentaire
* @param {string}   topic_id    ID de la discussion liée au commentaire. 
* @param {string}   id          ID du commentaire à valider.
*/
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

/*
* Invalider un commentaire
* @param {string}   topic_id    ID de la discussion liée au commentaire. 
*/
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

/*
* Récupérer les dernières discussions créées
* @return {string}    Liste des discussions
*                       Pas au format array, mais en chaine de caractère   
*/
function discussionsRecentes(){
    
    var retour = "test";
    db = $.couch.db("argile-forum");
    db.view("argile-forum/discussions", {
        success: function(data) {
            for(i in data.rows){
                retour = retour+", "+data.rows[i].value.title;
            }
            alert("fin : "+retour);
        }
    });
    return retour;
}



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