function Pomodoro(options) {
    this._ACTIVE = 1;
    this._INACTIVE = 0;

    var notifications = require("sdk/notifications");
    var tmr = require('sdk/timers');
    var events = require("sdk/system/events");

    this._LABEL_ADDON_NAME = "PomodoroFox";
    this._LABEL_START_TIMER = "Start pomodoro timer";
    this._LABEL_TIME_REMAINING = " minutes remaining. Click to stop.";
    this._NOTIFICATION_TIMEOUT = "Time for a break";
    this._NOTIFICATION_TIMER_STARTED = "Timer started";
    this._NOTIFICATION_TIMER_STOPPED = "Timer stopped";
    this._NOTIFICATION_TIMER_CANNOT_STOP = "Strict mode is enabled. You can't stop the timer manually!";
    this._ERROR_BAD_FORMAT_DOMAIN_LIST = "Cannot read blocked domain list. Please check the configuration.";

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

    this.startTimer = function(caller, time) {
        this.timerIsOn = true;
        var instance = this;
        this.settings.timeActivityPeriod = time;
        var accumulated = 1;
        caller.label = time + this._LABEL_TIME_REMAINING;
        this.interval = tmr.setInterval(function(){
            caller.tooltiptext = instance._LABEL_ADDON_NAME + ': ' +(time - accumulated) + instance._LABEL_TIME_REMAINING;
            instance.toggleIcon(caller, instance._ACTIVE, (time - accumulated));
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
        this.toggleIcon(caller, this._INACTIVE, 0);
    };

    this.toggleIcon = function(caller,status, minutes)
    {
        switch (status) {
            case this._ACTIVE:
                caller.badge = minutes;
                caller.type = "active";
                caller.tooltiptext = this._LABEL_ADDON_NAME + ': ' + minutes + this._LABEL_TIME_REMAINING;
                break;
            case this._INACTIVE:
                caller.badge = null;
                caller.type = "inactive";
                caller.tooltiptext = this._LABEL_START_TIMER;
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