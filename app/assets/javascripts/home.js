$(function() {
    // more info popovers
    $(document).popover({
        selector: '[rel=popover]',
        trigger: 'hover',
        html: true
    });


    // invalid selection tooltips
    $(document).tooltip({
        selector: '[rel=tooltip]',
        placement: 'right'
    });


    // course evaluation linkout
    $(document).on('click', '.course-evaluation', function(e) {
        e.preventDefault();
        $('#course-evaluation-form').find('input').val($(this).attr('data-professor')).parent().submit();
    });


    // scroll to top
    $(document).on('click', 'p.scroll', function() {
        $('html, body').animate({
            scrollTop: 0
        }, 500);
    });
});


// time pad formatting
function pad(time) {
    return ((time.toString().length == 1) ? ('0'+time) : (time));
}


// convert stored time to object
function intTimeToObject(time) {
    time = {
        time: time,
        hour24: Math.floor(time / 100)
    };

    time.hour = (time.hour24 > 12) ? (time.hour24 - 12) : time.hour24;
    time.minute = time.time - (time.hour24 * 100);
    time.ampm = (time.hour24 < 12) ? 'am' : 'pm';
    time.formatted = time.hour + ':' + pad(time.minute) + time.ampm;

    return time;
}

Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};
