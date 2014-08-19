var { ActionButton } = require('sdk/ui/button/action');
var { Pomodoro } = require('Pomodoro');
var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");

var notificationIconURL = data.url("./pomodoro-active-64.png");
var pomodoroInstance = new Pomodoro(getPomodoroSettings());

var blockedDomainString = require('sdk/simple-prefs').prefs['blockedDomainsList'];
var blockedDomainList = [];

if (typeof blockedDomainString == 'string') {
    blockedDomainList = blockedDomainString.split(",");
} else {
   pomodoroInstance.toast(pomodoroInstance._ERROR_BAD_FORMAT_DOMAIN_LIST);
}

var pomodoroButton = ActionButton({
    id: "pomodoro-button",
    label: pomodoroInstance._LABEL_START_TIMER,
    icon: pomodoroInstance.toggleIcon(pomodoroInstance._INACTIVE),
    onClick: handleClick
});

function handleClick()
{
    var strictMode = require('sdk/simple-prefs').prefs['strictMode'];
    if (pomodoroInstance.timerIsOn) {
        if (strictMode) {
            console.log("strict mode enabled. Cannot stop timer");
            pomodoroInstance.toast(pomodoroInstance._NOTIFICATION_TIMER_CANNOT_STOP);
        } else {
            console.log("stopping timer");
            pomodoroInstance.stopTimer(pomodoroButton);
            pomodoroButton.icon = pomodoroInstance.toggleIcon(pomodoroInstance._INACTIVE);
            pomodoroInstance.toast(pomodoroInstance._NOTIFICATION_TIMER_STOPPED);
        }
    } else {
        console.log("starting timer");
        pomodoroInstance.startTimer(pomodoroButton, require('sdk/simple-prefs').prefs['timeActivityPeriod']);
        pomodoroButton.icon = pomodoroInstance.toggleIcon(pomodoroInstance._ACTIVE);
        pomodoroInstance.toast(pomodoroInstance._NOTIFICATION_TIMER_STARTED);
    }
}

function getPomodoroSettings()
{
    return {
        timeActivityPeriod : require('sdk/simple-prefs').prefs['timeActivityPeriod'],
        strictMode : require('sdk/simple-prefs').prefs['strictMode'],
        notificationIconURL : notificationIconURL
    };
}

pageMod.PageMod({
    include: blockedDomainList,
    contentScriptFile: data.url('./banner.js'),
    contentScriptOptions: {pomodoroInstance: pomodoroInstance, url: data.url("pomodoro-active.png")},
    contentScriptWhen: "ready",
    contentStyle: "body {" +
    "  font-family: Helvetica !important;" +
    "  background-color: white !important;" +
    "  color: black !important;" +
    "}"
});
