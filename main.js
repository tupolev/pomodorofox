var { ActionButton } = require('sdk/ui/button/action');
var { Pomodoro } = require('Pomodoro');
var {Cc, Ci, Cu}  = require('chrome');
var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");

var notificationIconURLActive = data.url("./pomodoro-active-64.png");
var notificationIconURLBreak = data.url("./pomodoro-break-64.png");

var blockedDomainString = require('sdk/simple-prefs').prefs['blockedDomainsList'];
var blockedDomainList = [];

var userstyles    = require("./userstyles"),
    os            = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS,
    windows       = {
        get active () { // Chrome window
            return require('sdk/window/utils').getMostRecentBrowserWindow()
        },
        get activeWindow () { // SDK window
            return require("sdk/windows").browserWindows.activeWindow
        }
    },
    isAustralis   = "gCustomizeMode" in windows.active,
    toolbarbutton = isAustralis ? require("toolbarbutton/new") : require("toolbarbutton/old");



var pomodoroInstance = new Pomodoro(getPomodoroSettings());

var pomodoroButton = toolbarbutton.ToolbarButton({
    id: "pomodoro-notifier",
    label: pomodoroInstance._LABEL_ADDON_NAME,
    tooltiptext: pomodoroInstance._LABEL_START_SESSION,
    onClick: handleClick
});

function handleClick()
{
    var strictMode = require('sdk/simple-prefs').prefs['strictMode'];
    if (pomodoroInstance.timerIsOn) {
        if (strictMode) {
            console.log("strict mode enabled. Cannot stop period");
            pomodoroInstance.toast(pomodoroInstance._NOTIFICATION_SESSION_CANNOT_STOP);
        } else {
            console.log("stopping session");
            //pomodoroInstance.stopTimer(pomodoroButton);
            pomodoroInstance.stopSession(pomodoroButton);
            pageMod.destroy();
            pomodoroInstance.toggleIcon(pomodoroButton, pomodoroInstance._INACTIVE, 0);
            pomodoroInstance.toast(pomodoroInstance._NOTIFICATION_SESSION_STOPPED);
        }
    } else {
        console.log("starting session");
        var time = require('sdk/simple-prefs').prefs['timeActivityPeriod'];
        //pomodoroInstance.startTimer(pomodoroButton, time);
        pageMod.PageMod({
            include: blockedDomainList,
            contentScriptFile: data.url('./banner.js'),
            contentScriptOptions: {pomodoroInstance: pomodoroInstance, url: data.url("pomodoro-active-128.png")},
            contentScriptWhen: "ready",
            contentStyle: "body {" +
            "  font-family: Helvetica !important;" +
            "  background-color: white !important;" +
            "  color: black !important;" +
            "}"
        });
        pomodoroInstance.startSession(pomodoroButton, time, pageMod);
        pomodoroInstance.toggleIcon(pomodoroButton, pomodoroInstance._ACTIVITY, time);
        pomodoroInstance.toast(pomodoroInstance._NOTIFICATION_SESSION_STARTED);
    }
}

function getPomodoroSettings()
{
    return {
        numCyclesPerSession : require('sdk/simple-prefs').prefs['numCyclesPerSession'],
        timeActivityPeriod : require('sdk/simple-prefs').prefs['timeActivityPeriod'],
        timeBreakPeriod : require('sdk/simple-prefs').prefs['timeBreakPeriod'],
        strictMode : require('sdk/simple-prefs').prefs['strictMode'],
        notificationIconURLActive : notificationIconURLActive,
        notificationIconURLBreak : notificationIconURLBreak
    };
}

if (typeof blockedDomainString == 'string') {
    blockedDomainList = blockedDomainString.split(",");
} else {
    pomodoroInstance.toast(pomodoroInstance._ERROR_BAD_FORMAT_DOMAIN_LIST);
}
userstyles.load(data.url("overlay.css"));
if (os == "Linux") {
    userstyles.load(data.url("overlay-linux.css"));
} else if (os == "Darwin") {
    userstyles.load(data.url("overlay-darwin.css"));
}

pomodoroInstance.toggleIcon(pomodoroButton, pomodoroInstance._INACTIVE, 0);
