odoo.define('satya_chatillon.snippet', function (require) {
'use strict';

    var core = require('web.core');

    let modales = document.getElementsByClassName("modal");

    // Get the button that opens the modal
    let btn = new Array(
      document.getElementById("satya"),
      document.getElementById("esqueleto"),
      document.getElementById("clases-dibujo"),
      document.getElementById("fieras"),
      document.getElementById("adj"),
      document.getElementById("changos"),
      document.getElementById("dibujo-modelo"),
      document.getElementById("pegadas"),
      document.getElementById("ilustraciones"),
      document.getElementById("retratos"),
      document.getElementById("encuerados"),
      document.getElementById("tatuados"),
      document.getElementById("prensa"),
      document.getElementById("poesie-deplie"),
      document.getElementById("carteles"),
      document.getElementById("ppp")
      );

    // Get the <span> element that closes the modal
    let spans = Array.from(document.getElementsByClassName("close"));

    // When the user clicks the button, open the modal
    btn.forEach(displayBlock);
    function displayBlock(item) {
      item.onclick = function() {
        let modal = returnModal(item.id);
        modal.style.display = "block";
      }
    }
    // When the user clicks on <span> (x), close the modal
    spans.forEach(displayNone);
    function displayNone(item) {
      item.onclick = function() {
        let modal = document.getElementById(item.parentElement.parentElement.parentElement.id);
        modal.style.display = "none";
      }
    }
    function returnModal(modalId){
      switch(modalId) {
        case "satya":
          return document.getElementById("satya-modal");
        case "esqueleto":
          return document.getElementById("esqueleto-modal");
        case "clases-dibujo":
          return document.getElementById("clases-dibujo-modal");
        case "fieras":
          return document.getElementById("fieras-modal");
        case "adj":
          return document.getElementById("adj-modal");
        case "changos":
          return document.getElementById("changos-modal");
        case "dibujo-modelo":
          return document.getElementById("dibujo-modelo-modal");
        case "pegadas":
          return document.getElementById("pegadas-modal");
        case "ilustraciones":
          return document.getElementById("ilustraciones-modal");
        case "retratos":
          return document.getElementById("retratos-modal");
        case "encuerados":
          return document.getElementById("encuerados-modal");
        case "tatuados":
          return document.getElementById("tatuados-modal");
        case "prensa":
          return document.getElementById("prensa-modal");
        case "poesie-deplie":
          return document.getElementById("poesie-deplie-modal");
        case "carteles":
          return document.getElementById("carteles-modal");
        case "ppp":
          return document.getElementById("ppp-modal");
    }
    }


    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      let count = modales.length;
      for(let i = 0; i < count; i++) {
        if (event.target == modales[i]) {
          modales[i].style.display = "none";
        }
      }
    }

    return {
 // if you created functionality to export, add it here
    }
});