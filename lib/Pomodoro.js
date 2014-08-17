function Pomodoro(options) {
    var notifications = require("sdk/notifications");
    var tmr = require('sdk/timers');
    var events = require("sdk/system/events");
    this.settings = {
        timeActivityPeriod: options.timeActivityPeriod !== null ? options.timeActivityPeriod : 25,
        notificationIconURL: options.notificationIconURL !== null ? options.notificationIconURL : null
    };
    this.timerIsOn = false;
    this.timerInstance = null;

    this.onTimeOut = function(caller){
        this.stopTimer();
        console.log("stopping timer");
        caller.icon = this.toggleIcon('inactive');
        this.toast("Time for a break");
        events.emit("timeout", null);
    };

    this.startTimer = function(caller) {
        this.timerIsOn = true;
        var instance = this;
        this.timerInstance = tmr.setTimeout(function() {
            instance.onTimeOut(caller);
        }, parseInt(this.settings.timeActivityPeriod) * 60 * 1000);
    };

    this.stopTimer = function() {
        tmr.clearTimeout(this.timerInstance);
        this.timerIsOn = false;
    };
    this.toggleIcon = function(status)
    {
        switch (status) {
            case 'active': return {
                "16": "./pomodoro-active-16.png",
                "32": "./pomodoro-active-32.png",
                "64": "./pomodoro-active-64.png"
            };
                break;
            case 'inactive': return {
                "16": "./pomodoro-inactive-16.png",
                "32": "./pomodoro-inactive-32.png",
                "64": "./pomodoro-inactive-64.png"
            };
        }
    };
    this.toast = function(message)
    {
        notifications.notify({
            title: "PomodoroFox",
            text: message,
            iconURL: this.settings.notificationIconURL
        });
    }
}

exports.Pomodoro = Pomodoro;