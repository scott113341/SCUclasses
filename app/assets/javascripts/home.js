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
    $(document).on('click','.course-evaluation',function() {
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







function courseOptionsCtrl($scope,$http) {
    $scope.courses = {};


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
                // if not already added
                if (!$scope.courses[name]) {
                    // add course
                    $scope.courses[name] = [];
                    _.each(courses,function(course) {
                        // compute more values
                        course.time_start = intTimeToObject(course.time_start);
                        course.time_end = intTimeToObject(course.time_end);
                        course.show = false;
                        course.style = $scope.courseCalendarStyle(course);

                        // add to courses
                        $scope.courses[course.name].push(course);
                    });
                }
                console.log($scope.courses);
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
            var days = course.days.split('');
            if (_.contains(days,day)) return true;
            else return false;
        }
    };


    // pluralize seats?
    $scope.plural = function(seats) {
        if (seats == 1) return '';
        else return 's';
    };
}
courseOptionsCtrl.$inject = ['$scope','$http'];
