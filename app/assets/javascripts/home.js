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
































$(function() {
    // course typeahead
    $('[ng-model="addCourseText"]').typeahead({
        source: js_courses,
        items: 10,
        updater: function(item) {
            // trigger input submit
            setTimeout(function() {
                var scope = angular.element(document).scope();
                scope.$broadcast('submit');
            },0);
            return item;
        }
    });
});


// course evaluation linkout
$('.course-evaluation').live('click', function(e) {
    $('#course-evaluation-form').find('input').val($(this).text());
    $('#course-evaluation-form').submit();
});


// time pad formatting
function pad(time) {
    return ((time.toString().length == 1) ? ('0'+time) : (time));
}


// convert stored time to object
function intTimeToObject(time) {
    var time = {
        time: time,
        hour24: Math.floor(time / 100),
    };

    time.hour = (time.hour24 > 12) ? (time.hour24 - 12) : time.hour24;
    time.minute = time.time - (time.hour24 * 100);
    time.ampm = (time.hour24 < 12) ? 'am' : 'pm';
    time.formatted = time.hour + ':' + pad(time.minute) + time.ampm;

    return time;
}







function courseOptionsController($scope,$http,$window) {
    $scope.courses = [];


    // update model after typeahead submit
    $('[ng-model="addCourseText"]').change(function(event) {
        $scope.$apply(function(scope){
            scope.addCourseText = event.target.value;
        });
    });


    // submit listener from typeahead select callback
    $scope.$on('submit', function(e,a) {
        // extract course name from input and clear
        var name = $scope.addCourseText;
        $('[ng-model="addCourseText"]').val('');

        // add course
        $scope.addCourse(name);
    });


    // add course details via ajax
    $scope.addCourse = function(name) {
        // request courses and add to model
        $http.get('/admin/course/' + name + '.json').
            success(function(courses) {
                console.log(courses);
                _.each(courses,function(course) {
                    var course_ids = _.pluck($scope.courses, 'id'); // get ids of already added courses
                    if (!_.contains(course_ids, course.id)) {
                        console.log($window);
                        course.time_start = intTimeToObject(course.time_start);
                        course.time_end = intTimeToObject(course.time_end);

                        _.extend(course,{
                            show: false,
                            style: $scope.courseCalendarStyle(course)
                        });
                        $scope.courses.push(course);
                    }
                });
            });
    };


    // calculate course position on calendar
    $scope.courseCalendarStyle = function(course) {
        var style = {};

        style.top = 25 + (40 * (course.time_start.hour24 - 7 + course.time_start.minute/60)) + 'px';
        style.height = 40 * (course.time_end.hour24 - course.time_start.hour24 + (course.time_end.minute - course.time_start.minute)/60) + 'px';

        return style;
    };


    // tell if should show course on particular day
    $scope.showCourseBlock = function(course, day) {
        if (course.show == false) return false;
        else {
            console.log('here')
            var days = course.days.split('');
            console.log(days,day)
            if (_.contains(days,day)) return true;
            else return false;
        }
    };
}
