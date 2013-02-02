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


    // course evaluation linkout
    $('.course-evaluation').live('click', function(e) {
        $('#course-evaluation-form').find('input').val($(this).text());
        $('#course-evaluation-form').submit();
    });
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
        $http.get('/courses?name=' + name).
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
