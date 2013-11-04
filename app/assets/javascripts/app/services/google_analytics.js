app.service('GoogleAnalyticsService', function() {
  this.send = function(event, opt_value, opt_noninteraction) {
    // _trackEvent(category, action, opt_label, opt_value, opt_noninteraction)

    // parse event and require at least category and action
    event = event.split('.');
    if (event.length < 2) return;

    // complete the event array
    if (opt_value !== undefined)          event[3] = opt_value;
    if (opt_noninteraction !== undefined) event[4] = opt_noninteraction;

    // set undefined values as undefined
    for (var i=0; i<=4; i++) {
      if (event[i] === undefined) event[i] = undefined;
    }

    event.unshift('_trackEvent');
    console.log(event);
    _gaq.push(event);
  };
});
