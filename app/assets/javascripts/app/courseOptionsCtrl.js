app.controller('courseOptionsCtrl', function($scope, $http, $timeout) {
  $scope.courses = [];
  $scope.core_all = js_core_all;
  $scope.core = js_core;


  // typeahead search function
  $scope.addCourseTextSearch = function(query) {
    return $.map(js_courses, function(country) {
      return country;
    });
  };


  // typeahead selection listener
  $scope.$on('typeahead-updated', function() {
    // add course
    $scope.addCourse($scope.addCourseText, false);

    // reset input
    $scope.addCourseText = '';
    $('[ng-model="addCourseText"]').focus();
  });


  // add course by name via ajax
  $scope.addCourse = function(name, core, saved_sections) {
    // parse name
    if (name) name = name.split(' - ')[0];

    // request courses and add to model
    var req = '?' + ((name) ? 'name='+name : 'core='+core);

    // if not already added
    if ((_.where($scope.courses, {name: name}).length==0) && (_.where($scope.courses, {name: core}).length==0)) {
      $http.get('/search' + req).
        success(function(sections) {
          // add course
          var thiscourse = {};
          $scope.courses.push(thiscourse);

          // set course details
          thiscourse.name = (name) ? name : core;
          thiscourse.nameandfullname = (name) ? name+' - '+sections[0].fullname : 'Core: '+_.findWhere(js_core, {name:core}).fullname;
          thiscourse.show = true;
          thiscourse.number = _.size($scope.courses) - 1;
          thiscourse.sections = [];
          thiscourse.iscore = (name) ? false : true;

          // add sections
          _.each(sections,function(section) {
            // compute more values
            section.time_start = intTimeToObject(section.time_start);
            section.time_end = intTimeToObject(section.time_end);
            section.selected = (_.contains(saved_sections,section.id)) ? true : false;
            section.style = $scope.sectionCalendarStyle(section);
            section.cores = (section.core) ? section.core.split(',') : [];

            if (/lab/gi.test(section.fullname)) {
              section.cores.push('LAB');
              section.islab = true;
            }
            else section.islab = false;

            // add to courses
            thiscourse.sections.push(section);
          });

          console.log($scope.courses);

          $scope.selectedcore = 'default';
        });
    }

    // check for lab section on add course
    var lab = _.filter(js_courses, function(course) {
      return (course.indexOf(name + 'L') != -1);
    });
    if (lab[0] && !saved_sections) $scope.addCourse(lab[0]);
  };


  // add course by core
  $scope.selectedcore = 'default';
  $scope.addCourseCore = function() {
    if ($scope.selectedcore != 'default') {
      $scope.addCourse(false, $scope.selectedcore);
    }
  };


  // remove course on delete button click
  $scope.removeCourse = function(course) {
    a = course.number;
    $scope.courses.remove(a);
    _.each($scope.courses, function(course, b) {
      if (b >= a) course.number += -1;
    });
  };


  // clear all courses on clear schedule click
  $scope.clearCourses = function() {
    $scope.courses = [];
    $('input[ng-model=addCourseText]').val('').select();
  };


  // courses added
  $scope.coursesAdded = function() {
    return $scope.courses.length;
  };


  // sections added
  $scope.sectionsAdded = function() {
    var sectionsadded = [];
    _.each($scope.courses, function(course) {
      _.each(course.sections, function(section) {
        if (section.selected) sectionsadded.push(section);
      });
    });
    return sectionsadded;
  };


  // csv list of section ids
  $scope.sectionIds = function() {
    return _.pluck($scope.sectionsAdded(), 'id').join(',');
  };


  // validate sections based off of selections
  $scope.isValidChoice = function(section) {
    if (section.selected == true) return true;
    else {
      var valid = true;
      var conflictingfunction = '';
      _.each($scope.courses, function(course, name) { // for each course
        _.each(course.sections, function(section2) { // for each section2
          if (section2.selected == true && valid == true) { // if section2 is selected
            // if the sections share common days
            if (_.intersection(section.days.split(''), section2.days.split('')).length > 0) {
              // test if starts during
              if (section.time_start.time >= section2.time_start.time && section.time_start.time <= section2.time_end.time) valid = false;

              // test if ends during
              if (section.time_end.time >= section2.time_start.time && section.time_end.time <= section2.time_end.time) valid = false;

              // test if starts before and ends after
              if (section.time_start.time <= section2.time_start.time && section.time_end.time >= section2.time_end.time) valid = false;

              // save conflicting section
              if (valid == false) conflictingsection = section2;
            }
          }
        });
      });

      // clear invalid reason
      section.invalidbecause = '';

      // if section is full
      if (section.seats == 0) {
        section.invalidbecause = 'Section is full';
        section.isfull = true;
      }
      else section.isfull = false;

      // if section conflicts
      if (valid == false) section.invalidbecause = 'Conflicts with ' + conflictingsection.name;

      return valid;
    }
  };


  // calculate section position on calendar
  $scope.sectionCalendarStyle = function(section) {
    var hourheight = 35;
    var style = {};

    style.top = 25 + (hourheight * (section.time_start.hour24 - 7 + section.time_start.minute/60)) + 'px';
    style.height = hourheight * (section.time_end.hour24 - section.time_start.hour24 + (section.time_end.minute - section.time_start.minute)/60) + 'px';
    style.computed = {
      top: style.top,
      height: style.height
    };

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


  // pluralize
  $scope.plural = function(num) {
    if (num == 1) return '';
    else return 's';
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
    popover += '<tr><td>Professor: </td><td>' + section.instructors + '</td></tr>';

    popover += '<tr><td>Core fulfilled: </td><td>';
    _.each(section.cores, function(core) {
      popover += '<span class="label label-info">' + ((a = _.findWhere(js_core_all, {name: core})) ? a.fullname : '') + '</span> ';
    });
    popover += '</td></tr>';

    popover += '<tr><td>Seats left: </td><td>'+ section.seats +'</td></tr>';
    popover += '<tr><td>Units: </td><td>'+ section.units +'</td></tr>';
    popover += '<tr><td>Location: </td><td>'+ section.location +'</td></tr>';
    popover += '<tr><td>Description: </td><td>'+ section.description +'</td></tr>';
    popover += '</tbody></table>';
    return popover;
  };


  // units added
  $scope.units = function() {
    var units = 0;
    _.each($scope.sectionsAdded(), function(section) {
      units += section.units;
    });
    return units;
  };


  // check for full/closed sections
  $scope.fullSections = function() {
    var badsections = [];
    _.each($scope.sectionsAdded(), function(section) {
      if (section.seats == 0) badsections.push(section);
    });
    return badsections;
  };


  // last updated
  $scope.lastupdated = js_lastupdated - 2;
  $scope.incrementMinute = function() {
    $scope.lastupdated++;
    $timeout($scope.incrementMinute, 60*1000);
  };
  $scope.incrementMinute();


  // clear localstorage if new term
  if (store.get('term') != js_term) {
    store.remove('courses');
    store.set('term', js_term);
  }


  // load from localstorage
  if (store.enabled && store.get('courses')) {
    _.each(store.get('courses'), function(course) {
      // create add array
      var add = [false, false, []];
      add[0] = (!course.iscore) ? course.nameandfullname : false;
      add[1] = (!course.iscore) ? false : _.findWhere(js_core_all, {fullname: course.nameandfullname.substr(6)}).name;

      // add each selected section id to add array
      _.each(course.sections, function(section) {
        if (section.selected) add[2].push(section.id);
      });

      // add course and selected sections
      $scope.addCourse(add[0], add[1], add[2]);
    });
  }


  // save to localstorage
  $scope.$watch('courses', function(courses) {
    store.set('courses', courses);
    console.log('saved');
  }, true);
});
