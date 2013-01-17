$(function() {
    $('#course-add').typeahead({
        source: js_courses,
        items: 10,
        updater: function(item) {
            if (_.contains(js_courses, item)) {
                $.ajax({
                    url: '/admin/course/' + item + '.json',
                    success: function(courses) {
                        console.log(courses)

                        var context = {
                            courses: courses,
                        }

                        generateSchedule(courses);
                        checkOverlap(courses);
                        drawCalendar(courses);

                        $('#courses-added').html(renderBars('#courses-added-template', context));
                    },
                });
            }
        }
    });


    $('.course-evaluation').live('click', function(e) {
        $('#course-evaluation-form').find('input').val($(this).text());
        $('#course-evaluation-form').submit();
    });
});





function generateSchedule(courses) {
    courses.forEach(function(course) {
        course.schedule = {};
        var days = course.days.split('');
        ['M','T','W','R','F','S','U'].forEach(function(day) {
            course.schedule[day] = (_.contains(days, day)) ? true : false;
        });
    });
}


function checkOverlap(courses) {
    // output
    var conflicts = [];

    // make unlinked copy of courses
    courses = courses.slice(0);

    // for each course
    while (courses.length > 0) {
        var course_test = courses.shift();
        console.log('testing', course_test.id);
        //var overlaps = false;

        // test against each remaining course
        courses.forEach(function(course) {
            var overlaps = false;

            // test if starts during
            if (course_test.time_start >= course.time_start && course_test.time_start <= course.time_end) {
                console.log(course_test.id, 'starts during', course.id);
                overlaps = true;
            }

            // test if ends during
            if (course_test.time_end >= course.time_start && course_test.time_end <= course.time_end) {
                console.log(course_test.id, 'ends during', course.id);
                overlaps = true;
            }

            // test if starts before and ends after
            if (course_test.time_start <= course.time_start && course_test.time_end >= course.time_end) {
                console.log(course_test.id, 'starts before and ends after', course.id);
                overlaps = true;
            }

            // test if don't share a common day
            if (_.intersection( course_test.days.split(''), course_test.days.split('')).length == 0) {
                console.log(course_test.id, 'doesnt share a day with', course.id);
                overlaps = false;
            }

            // if overlaps, add to conflicts
            if (overlaps) {
                conflicts.push(course_test.id + ' conflicts with ' + course.id);
            }
        });
    }
    console.log(conflicts);
}



function pad(time) {
    return ((time.toString().length == 1) ? ('0'+time) : (time));
}




function renderBars(template_id, context) {
    var source = $(template_id).html();
    var template = Handlebars.compile(source);
    return template(context);
}






function drawCalendar(courses) {
    generateSchedule(courses);

    console.log(courses);

    courses.forEach(function(course) {
        _.each(course.schedule, function(isclass, day) {
            console.log(day,isclass);
            if (isclass) {
                var time_start = inttimeToObject(course.time_start);
                var time_end = inttimeToObject(course.time_end);

                course.style = {};
                course.style.height = 40 * (time_end.hour24 - time_start.hour24 + (time_end.minute - time_start.minute)/60) + 'px';
                course.style.top = 25 + (40 * (time_start.hour24 - 7 + time_start.minute/60)) + 'px';

                var context = {
                    course: course,
                }
                var render = renderBars('#calendar-course', context);
                $('#' + day).append(render);
            }
        });
    });
}


$(function() {
    Handlebars.registerHelper('formatTime', function(time) {
        var time = inttimeToObject(time);
        return time.hour + ':' + pad(time.minute) + time.ampm;
    });
});



function inttimeToObject(time) {
    var time = {
        time: time,
        hour24: Math.floor(time / 100),
    };

    time.hour = (time.hour24 > 12) ? (time.hour24 - 12) : time.hour24;
    time.minute = time.time - (time.hour24 * 100);
    time.ampm = (time.hour24 < 12) ? 'am' : 'pm';

    return time;
}