(function(){
    var jquery = document.createElement("script");
    jquery.type = "text/javascript";
    jquery.src = chrome.extension.getURL("src/jquery-1.11.1.min.js");
    jquery.onload = function() {
        var s = document.createElement("script");
        s.type = "text/javascript";
        s.src = chrome.extension.getURL("src/main.js");
        document.head.appendChild(s);
    }
    document.head.appendChild(jquery);

})();

