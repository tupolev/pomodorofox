var { ActionButton } = require('sdk/ui/button/action');
var { Pomodoro } = require('Pomodoro');
var {Cc, Ci, Cu}  = require('chrome');
//var timer = require('sdk/timers');
var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");

var notificationIconURL = data.url("./pomodoro-active-64.png");

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

userstyles.load(data.url("overlay.css"));
if (os == "Linux") {
    userstyles.load(data.url("overlay-linux.css"));
}
else if (os == "Darwin") {
    userstyles.load(data.url("overlay-darwin.css"));
}

//var config = {
//    toolbar: {
//        id: "pomodoro-notifier",
//        move: {
//            toolbarID: "nav-bar-pomodoro",
//            insertbefore: "home-button",
//            forceMove: true
//        }
//    }
//};
var pomodoroInstance = new Pomodoro(getPomodoroSettings());

var pomodoroButton = toolbarbutton.ToolbarButton({
    id: "pomodoro-notifier",
    label: pomodoroInstance._LABEL_ADDON_NAME,
    tooltiptext: pomodoroInstance._LABEL_START_TIMER,
    onClick: handleClick
});

if (typeof blockedDomainString == 'string') {
    blockedDomainList = blockedDomainString.split(",");
} else {
   pomodoroInstance.toast(pomodoroInstance._ERROR_BAD_FORMAT_DOMAIN_LIST);
}

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
            pomodoroInstance.toggleIcon(pomodoroButton, pomodoroInstance._INACTIVE, 0);
            pomodoroInstance.toast(pomodoroInstance._NOTIFICATION_TIMER_STOPPED);
        }
    } else {
        console.log("starting timer");
        var time = require('sdk/simple-prefs').prefs['timeActivityPeriod'];
        pomodoroInstance.startTimer(pomodoroButton, time);
        pomodoroInstance.toggleIcon(pomodoroButton, pomodoroInstance._ACTIVE, time);
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
pomodoroInstance.toggleIcon(pomodoroButton, pomodoroInstance._INACTIVE, 0);
//exports.main = function(options, callbacks) {
//    timer.setTimeout(function (){
//        pomodoroButton.moveTo(config.toolbar.move);
//    }, 800);
//};
