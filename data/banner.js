window.href = "";
console.log("match");
document.body.innerHTML = "";
var bodyStyle = "body {" +
    "  font-family: Helvetica !important;" +
    "  font-size: 12px !important;" +
    "  background-color: white !important;" +
    "  color: black !important;" +
    "}";
document.body.setAttribute("style", bodyStyle);
var div = document.createElement("div");
var h1 = document.createElement("h1");
var h3 = document.createElement("h3");
var h5 = document.createElement("h5");
var image = document.createElement("img");
image.setAttribute("src", self.options.url);
image.setAttribute("alt", "PomodoroFox Icon");
h1.appendChild(document.createTextNode("THIS DOMAIN IS BLOCKED WHILE A POMODORO TIMER IS RUNNING"));
h1.setAttribute("style", "font-size: 18px; font-weight: bold; !important;");
h3.appendChild(document.createTextNode("Please, wait until your next short or long break."));
h3.setAttribute("style", "font-size: 14px; font-weight: bold; !important;");
h5.appendChild(document.createTextNode("PomodoroFox add-on for Firefox"));
h5.setAttribute("style", "font-size: 11px; font-weight: bold; !important;");
div.appendChild(h1);
div.appendChild(h3);
div.appendChild(image);
div.appendChild(h5);
div.setAttribute("style", "text-align: center; margin: 50px 50px 50px 50px;");
document.body.appendChild(div);