if (self.options.pomodoroInstance.timerIsOn) {
    window.href = "";
    console.log("match");
    document.body.innerHTML = "";
    var div = document.createElement("div");
    var h1 = document.createElement("h1");
    var h3 = document.createElement("h3");
    h1.appendChild(document.createTextNode("THIS DOMAIN IS BLOCKED WHILE A POMODORO TIMER IS RUNNING"));
    h3.appendChild(document.createTextNode("Please, wait until your next short or long break."));
    div.appendChild(h1);
    div.appendChild(h3);
    document.body.appendChild(div);
}