function Pomodoro(options) {
    var notifications = require("sdk/notifications");
    var tmr = require('sdk/timers');
    var events = require("sdk/system/events");

    this._LABEL_ADDON_NAME = "PomodoroFox";
    this._LABEL_START_TIMER = "Start pomodoro timer";
    this._LABEL_STOP_TIMER = "Stop pomodoro timer";
    this._LABEL_TIME_REMAINING = " minutes remaining. Click to stop.";
    this._NOTIFICATION_TIMEOUT = "Time for a break";
    this._NOTIFICATION_TIMER_STARTED = "Timer started";
    this._NOTIFICATION_TIMER_STOPPED = "Timer stopped";
    this._NOTIFICATION_TIMER_CANNOT_STOP = "Strict mode is enabled. You can't stop the timer manually!";

    this.settings = {
        timeActivityPeriod: options.timeActivityPeriod !== null ? options.timeActivityPeriod : 25,
        strictMode: options.strictMode !== null ? options.strictMode : false,
        notificationIconURL: options.notificationIconURL !== null ? options.notificationIconURL : null
    };
    this.timerIsOn = false;
    this.timerInstance = null;
    this.interval = null;

    this.onTimeOut = function(caller){
        this.stopTimer(caller);
        this.toast(this._NOTIFICATION_TIMEOUT);
    };

    this.startTimer = function(caller) {
        this.timerIsOn = true;
        var instance = this;
        var maxTime = this.settings.timeActivityPeriod;
        var accumulated = 0;
        caller.label = maxTime + this._LABEL_TIME_REMAINING;
        this.interval = tmr.setInterval(function(){
            caller.label = (maxTime - accumulated) + instance._LABEL_TIME_REMAINING;
            accumulated++;
        }, 60 * 1000);
        this.timerInstance = tmr.setTimeout(function() {
            instance.onTimeOut(caller);
        }, parseInt(this.settings.timeActivityPeriod) * 60 * 1000);
    };

    this.stopTimer = function(caller) {
        tmr.clearTimeout(this.timerInstance);
        tmr.clearInterval(this.interval);
        this.timerIsOn = false;
        console.log("stopping timer");
        caller.icon = this.toggleIcon('inactive');
        caller.label = this._LABEL_START_TIMER;
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
            title: this._LABEL_ADDON_NAME,
            text: message,
            iconURL: this.settings.notificationIconURL
        });
    }
}

exports.Pomodoro = Pomodoro;