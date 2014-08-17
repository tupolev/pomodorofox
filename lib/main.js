var { ActionButton } = require('sdk/ui/button/action');
var { Toolbar } = require("sdk/ui/toolbar");
var { Pomodoro } = require('Pomodoro');
var tabs = require("sdk/tabs");
var data = require("sdk/self").data;
var events = require("sdk/system/events");
var pageMod = require("sdk/page-mod");

var notificationIconURL = data.url("./pomodoro-active-64.png");
var pomodoroInstance = new Pomodoro(getPomodoroSettings());

var pomodoroButton = ActionButton({
    id: "pomodoro-button",
    label: "Start pomodoro timer",
    icon: pomodoroInstance.toggleIcon('inactive'),
    onClick: handleClick
});

var toolbar = Toolbar({
    id: "pomodoro-toolbar",
    title: "PomodoroFox",
    items: [pomodoroButton]
});

function handleClick(state)
{
    if (pomodoroInstance.timerIsOn) {
        //alert("stopping timer");
        console.log("stopping timer");
        pomodoroInstance.stopTimer(pomodoroButton);
        pomodoroButton.icon = pomodoroInstance.toggleIcon('inactive');
        pomodoroInstance.toast("Timer stopped");
    } else {
        //alert("starting timer");
        console.log("starting timer");
        pomodoroInstance.startTimer(pomodoroButton);
        pomodoroButton.icon = pomodoroInstance.toggleIcon('active');
        pomodoroInstance.toast("Timer started");
    }
}

function getPomodoroSettings()
{
    return {
        timeActivityPeriod : require('sdk/simple-prefs').prefs['timeActivityPeriod'],
        notificationIconURL : notificationIconURL
    };
}


var blockedDomainList = require('sdk/simple-prefs').prefs['blockedDomainsList'].split(",");
var bodyContent = '<div><h1>THIS DOMAIN IS BLOCKED WHILE A POMMODORO TIMER IS RUNNING</h1>'
    + '<h3>Please, wait until your next short or long break.</h3></div>';
pageMod.PageMod({
    include: blockedDomainList,
    contentScript: 'if (self.options.pomodoroInstance.timerIsOn) { console.log("match"); document.body.innerHTML="' + bodyContent + '";}',
    contentScriptOptions: {pomodoroInstance: pomodoroInstance},
    contentScriptWhen: "end",
    contentStyle: "body {" +
    "  font-family: Helvetica !important;" +
    "  background-color: white !important;" +
    "  color: black !important;" +
    "}"
});

