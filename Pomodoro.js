function Pomodoro(options) {
    this._INACTIVE = 0;
    this._ACTIVITY = 1;
    this._BREAK = 2;

    var notifications = require("sdk/notifications");
    var tmr = require('sdk/timers');
    var events = require("sdk/system/events");
    var pageWorker = require("sdk/page-worker");
    var data = require("sdk/self").data;

    this._LABEL_ADDON_NAME = "PomodoroFox";
    this._LABEL_START_SESSION = "Start pomodoro session";
    this._LABEL_TIME_REMAINING_ACTIVITY = " minutes of activity remaining. Click to end session.";
    this._LABEL_TIME_REMAINING_BREAK = " minutes of break remaining. Click to end session.";
    this._NOTIFICATION_TIMEOUT_ACTIVITY = "Time for a break";
    this._NOTIFICATION_TIMEOUT_BREAK = "Time to go back to work";
    this._NOTIFICATION_SESSION_STARTED = "Session started";
    this._NOTIFICATION_SESSION_STOPPED = "Session stopped";
    this._NOTIFICATION_SESSION_FINISHED = "Session finished";
    this._NOTIFICATION_SESSION_CANNOT_STOP = "Strict mode is enabled. You can't stop periods manually!";
    this._ERROR_BAD_FORMAT_DOMAIN_LIST = "Cannot read blocked domain list. Please check the configuration.";

    this.settings = {
        numCyclesPerSession: options.numCyclesPerSession !== null ? options.numCyclesPerSession : 5,
        timeActivityPeriod: options.timeActivityPeriod !== null ? options.timeActivityPeriod : 25,
        timeBreakPeriod: options.timeBreakPeriod !== null ? options.timeBreakPeriod : 5,
        strictMode: options.strictMode !== null ? options.strictMode : false,
        notificationIconURLActive: options.notificationIconURLActive !== null ? options.notificationIconURLActive : null,
        notificationIconURLBreak: options.notificationIconURLBreak !== null ? options.notificationIconURLBreak : null
    };

    this.sessionActive = true;
    this.currentPeriod = this._INACTIVE;
    this.timerIsOn = false;
    this.timerInstance = null;
    this.interval = null;
    this.activityPeriodsCounter = 0;
    this.breakPeriodsCounter = 0;
    this.cycleCounter = 0;

    this.onTimeOut = function(caller){
        switch (this.currentPeriod) {
            case this._ACTIVITY:
                this.toast(this._NOTIFICATION_TIMEOUT_ACTIVITY);
                break;
            case this._BREAK:
                this.toast(this._NOTIFICATION_TIMEOUT_BREAK);
                break;
        }
        this.stopTimer(caller);
        this.play();
    };

    this.startTimer = function(caller, time, periodType) {
        this.currentPeriod = periodType;
        this.timerIsOn = true;
        var instance = this;
        this.settings.timeActivityPeriod = time;
        var accumulated = 1;
        var currentLabel = '';
        switch (periodType) {
            case this._ACTIVITY:
                currentLabel = this._LABEL_TIME_REMAINING_ACTIVITY;
                break;
            case this._BREAK:
                currentLabel = this._LABEL_TIME_REMAINING_BREAK;
                break;
        }
        caller.label = time + currentLabel;
        //instance.toggleIcon(caller, instance.currentPeriod, (time - accumulated));
        this.interval = tmr.setInterval(function(){
            caller.tooltiptext = instance._LABEL_ADDON_NAME + ': ' +(time - accumulated) + currentLabel;
            instance.toggleIcon(caller, instance.currentPeriod, (time - accumulated));
            accumulated++;
        }, 60 * 1000);
        this.timerInstance = tmr.setTimeout(function() {
            instance.onTimeOut(caller);
        }, parseInt(this.settings.timeActivityPeriod) * 60 * 1000);
    };

    this.stopTimer = function(caller) {

        if (this.cycleCounter < this.settings.numCyclesPerSession) {
            if (this.currentPeriod == this._ACTIVITY) {
                console.log("finished activity " + this.activityPeriodsCounter);
                this.activityPeriodsCounter++;
                //start break
                console.log("starting break " + this.breakPeriodsCounter);
                this.startTimer(caller, this.settings.timeBreakPeriod, this._BREAK);
            } else {
                console.log("finished break " + this.breakPeriodsCounter);
                this.breakPeriodsCounter++;
                console.log("finished cycle " + this.cycleCounter);
                this.cycleCounter++;
                console.log("starting cycle " + this.cycleCounter);
                //start activity
                console.log("starting activity " + this.activityPeriodsCounter);
                this.startTimer(caller, this.settings.timeActivityPeriod, this._ACTIVITY);
            }
        } else {
            tmr.clearTimeout(this.timerInstance);
            tmr.clearInterval(this.interval);
            this.timerIsOn = false;
            this.sessionActive = false;
            this.breakPeriodsCounter = 0;
            this.activityPeriodsCounter = 0;
            this.breakPeriodsCounter = 0;
            this.cycleCounter = 0;
            this.toast(this._NOTIFICATION_SESSION_FINISHED);
            console.log("finished session");
            this.toggleIcon(caller, this._INACTIVE, 0);
        }
    };

    this.toggleIcon = function(caller, status, minutes)
    {
        switch (status) {
            case this._ACTIVITY:
                caller.badge = minutes;
                caller.type = "activity";
                caller.tooltiptext = this._LABEL_ADDON_NAME + ': ' + minutes + this._LABEL_TIME_REMAINING_ACTIVITY;
                break;
            case this._BREAK:
                caller.badge = minutes;
                caller.type = "break";
                caller.tooltiptext = this._LABEL_ADDON_NAME + ': ' + minutes + this._LABEL_TIME_REMAINING_BREAK;
                break;
            case this._INACTIVE:
                caller.badge = null;
                caller.type = "inactive";
                caller.tooltiptext = this._LABEL_START_SESSION;
        }
    };

    this.toast = function(message)
    {
        notifications.notify({
            title: this._LABEL_ADDON_NAME,
            text: message,
            iconURL: this.settings.notificationIconURLActive
        });
    };

    this.play = function()
    {
        if (!require('sdk/simple-prefs').prefs['timeoutSound']) return;

        var path = "alert.wav";
        var worker = pageWorker.Page({
            contentScript: "var audio = new Audio('" + path + "'); audio.play();",
            contentURL: data.url("sound.html"),
            onMessage: function(arr) {
                worker.destroy();
            }
        });
    };

    this.startSession = function(caller, time)
    {
        this.sessionActive = true;
        this.breakPeriodsCounter = 0;
        this.activityPeriodsCounter = 0;
        this.breakPeriodsCounter = 0;
        this.cycleCounter = 0;
        console.log("starting session");
        console.log("starting cycle " + this.cycleCounter);
        //start activity
        console.log("starting activity " + this.activityPeriodsCounter);
        this.startTimer(caller, time, this._ACTIVITY);
    };

    this.stopSession = function(caller)
    {
        this.breakPeriodsCounter = 0;
        this.activityPeriodsCounter = 0;
        this.breakPeriodsCounter = 0;
        this.cycleCounter = 0;
        this.stopTimer(caller);
        this.sessionActive = false;
        this.toast(this._NOTIFICATION_SESSION_FINISHED);
    };
}

exports.Pomodoro = Pomodoro;