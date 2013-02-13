$(function() {
    // course typeahead
    $('[ng-model="addCourseText"]').typeahead({
        source: js_courses,
        items: 25,
        updater: function(item) {
            // trigger input submit
            setTimeout(function() {
                angular.element(document).scope().$broadcast('submit');
            }, 0);
            return item;
        }
    });


    // more info popovers
    $(document).popover({
        selector: '[rel=popover]',
        trigger: 'hover',
        html: true
    });


    // course evaluation linkout
    $(document).on('click', '.course-evaluation', function(e) {
        e.preventDefault();
        $('#course-evaluation-form').find('input').val($(this).text());
        $('#course-evaluation-form').submit();
    });


    // scroll to top
    $(document).on('click', 'p.scroll', function() {
        $('html, body').animate({
            scrollTop: 0
        }, 500);
    });


    // last updated counter

});


// time pad formatting
function pad(time) {
    return ((time.toString().length == 1) ? ('0'+time) : (time));
}


// convert stored time to object
function intTimeToObject(time) {
    var time = {
        time: time,
        hour24: Math.floor(time / 100)
    };

    time.hour = (time.hour24 > 12) ? (time.hour24 - 12) : time.hour24;
    time.minute = time.time - (time.hour24 * 100);
    time.ampm = (time.hour24 < 12) ? 'am' : 'pm';
    time.formatted = time.hour + ':' + pad(time.minute) + time.ampm;

    return time;
}





function courseOptionsCtrl($scope,$http,$timeout) {
    $scope.courses = {};
    $scope.core_all = js_core_all;
    $scope.core = js_core;


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
        // parse name
        name = name.split(' - ')[0];

        // request courses and add to model
        $http.get('/sections?name=' + name).
            success(function(sections) {
                // if not already added
                if (!$scope.courses[name]) {
                    // add course
                    $scope.courses[name] = [];
                    $scope.courses[name].show = true;
                    $scope.courses[name].number = _.size($scope.courses);

                    _.each(sections,function(section) {
                        // compute more values
                        section.time_start = intTimeToObject(section.time_start);
                        section.time_end = intTimeToObject(section.time_end);
                        section.selected = false;
                        section.style = $scope.sectionCalendarStyle(section);
                        section.cores = (section.core) ? section.core.split(',') : [];

                        if (/lab/gi.test(section.fullname)) {
                            section.cores.push('LAB');
                            section.islab = true;
                        }
                        else section.islab = false;

                        // add to courses
                        $scope.courses[section.name].push(section);
                    });
                }
                console.log($scope.courses);
            });
    };
//    $scope.addCourse('RSOC 9');


    // remove course on delete button click
    $scope.removeCourse = function(name) {
        delete $scope.courses[name];
    };


    // clear all courses on clear schedule click
    $scope.clearCourses = function() {
        $scope.courses = {};
        $('input[ng-model=addCourseText]').val('').select();
    };


    // validate sections based off of selections
    $scope.isValidChoice = function(section) {
        if (section.selected == true) return true;
        else {
            var valid = true;
            _.each($scope.courses, function(course, name) { // for each course
                _.each(course, function(section2) { // for each section2
                    if (section2.selected == true) { // if section2 is selected
                        // don't share a common day
                        if (_.intersection(section.days.split(''), section2.days.split('')).length == 0) {
                            //console.log(section.id, 'doesnt share a day with', section2.id);
                        }

                        // share common days
                        else {
                            // test if starts during
                            if (section.time_start.time >= section2.time_start.time && section.time_start.time <= section2.time_end.time) {
                                //console.log(section.id, 'starts during', section2.id);
                                valid = false;
                            }

                            // test if ends during
                            if (section.time_end.time >= section2.time_start.time && section.time_end.time <= section2.time_end.time) {
                                //console.log(section.id, 'ends during', section2.id);
                                valid = false;
                            }

                            // test if starts before and ends after
                            if (section.time_start.time <= section2.time_start.time && section.time_end.time >= section2.time_end.time) {
                                //console.log(section.id, 'starts before and ends after', section2.id);
                                valid = false;
                            }
                        }
                    }
                });
            });

            if (section.seats == 0) valid = false;

            return valid;
        }
    };


    // calculate section position on calendar
    $scope.sectionCalendarStyle = function(section) {
        var hourheight = 35;
        var style = {};

        style.top = 25 + (hourheight * (section.time_start.hour24 - 7 + section.time_start.minute/60)) + 'px';
        style.height = hourheight * (section.time_end.hour24 - section.time_start.hour24 + (section.time_end.minute - section.time_start.minute)/60) + 'px';

        return style;
    };


    // tell if should show section on particular day
    $scope.showSectionBlock = function(section, day) {
        if (section.selected == false) return false;
        else {
            var days = section.days.split('');
            if (_.contains(days,day)) return true;
            else return false;
        }
    };


    // pluralize seats?
    $scope.plural = function(seats) {
        if (seats == 1) return '';
        else return 's';
    };


    // format core and lab attributes
    $scope.formatCore = function(core) {
        return js_core[core];
    };


    // toggle showing of course sections
    $scope.toggleExpand = function(section) {
        section.show = !section.show;
    };


    // class for expand arrow
    $scope.expandArrow = function(course) {
        if (course.show) return 'icon-circle-arrow-up';
        else return 'icon-circle-arrow-down';
    };


    // show welcome message
    $scope.hideWelcomeMessage = function() {
        if (_.size($scope.courses)) return true;
        else return false;
    };


    // popover content
    $scope.popoverInfo = function(section) {
        var popover = '<table><tbody>';
        popover += '<tr><td>Class: </td><td>'+ section.name +'</td></tr>';
        popover += '<tr><td>Name: </td><td>'+ section.fullname +'</td></tr>';
        popover += '<tr><td>Course ID: </td><td>'+ section.id +'</td></tr>';
//        popover += '<tr><td>Course ID: </td><td><a href="http://www.scu.edu/courseavail/class/?fuseaction=details&class_nbr='+ section.id +'&term='+ js_term +'" target="_blank">'+ section.id +'</a></td></tr>';
        popover += '<tr><td>Professor: </td><td>' + section.instructors + '</td></tr>';
//        popover += '<tr><td>Professor: </td><td><a class="course-evaluation" href="">' + section.instructors + '</a></td></tr>';

        popover += '<tr><td>Core fulfilled: </td><td>';
        _.each(section.cores, function(core) {
            popover += '<span class="label">' + js_core_all[core] + '</span> ';
        });
        popover += '</td></tr>';

        popover += '<tr><td>Seats left: </td><td>'+ section.seats +'</td></tr>';
        popover += '<tr><td>Units: </td><td>'+ section.units +'</td></tr>';
        popover += '<tr><td>Description: </td><td>'+ section.description +'</td></tr>';
        popover += '</tbody></table>';
        return popover;
    };


    // last updated
    $scope.lastupdated = js_lastupdated - 1;
    $scope.incrementMinute = function() {
        $scope.lastupdated++;
        $timeout($scope.incrementMinute, 60*1000);
    };
    $scope.incrementMinute();
}
courseOptionsCtrl.$inject = ['$scope','$http','$timeout'];
