app.controller('courseOptionsCtrl', ['$scope', '$http', '$timeout', 'GoogleAnalyticsService', function($scope, $http, $timeout, GoogleAnalyticsService) {
  $scope.courses = [];
  $scope.core_all = js_core_all;
  $scope.core = js_core;


  // advanced search field setup
  $scope.asearch = {
    id: {
      description: function(value) {
        return 'ID: ' + value.id;
      }
    },
    core: {
      description: function(value) {
        var core = _.findWhere(js_core_all, {name: value.core});
        if (core) return 'Core: ' + core.fullname;
        else return false;
      }
    },
    core2: {
      description: function(value) {
        var core2 = _.findWhere(js_core_all, {name: value.core2});
        if (core2) return 'Core: ' + core2.fullname;
        else return false;
      }
    },
    department: {
      description: function(value) {
        return 'Dept: ' + value.department;
      }
    },
    instructors: {
      description: function(value) {
        return 'Professor: ' + value.instructors;
      }
    },
    seats: {
      description: function(value) {
        return 'Open seats';
      }
    },
    time_start: {
      description: function(value) {
        var ba = (value.time_start) ? value.time_start[0] : false;
        if (ba) ba = (ba == 'b') ? 'before' : 'after';

        var time = value.time_start;
        if (time) time = time.slice(1);

        if (ba && time) return 'Starts ' + ba + ' ' + time;
        else return false;
      },
      format: function(values_raw) {
        if (values_raw.ba && values_raw.time) return { time_start: values_raw.ba + values_raw.time };
        else return {};
      }
    },
    time_end: {
      description: function(value) {
        var ba = (value.time_end) ? value.time_end[0] : false;
        if (ba) ba = (ba == 'b') ? 'before' : 'after';

        var time = value.time_end;
        if (time) time = time.slice(1);

        if (ba && time) return 'Ends ' + ba + ' ' + time;
        else return false;
      },
      format: function(values_raw) {
        if (values_raw.ba && values_raw.time) return { time_end: values_raw.ba + values_raw.time };
        else return {};
      }
    },
    days: {
      description: function(value) {
        var days = [];
        var map = {
          m: 'Mon',
          t: 'Tue',
          w: 'Wed',
          r: 'Thu',
          f: 'Fri',
          s: 'Sat',
          u: 'Sun'
        };

        _.each(value.days.split(''), function(day) {
          days.push(map[day.toLowerCase()]);
        });

        return days.join('/');
      },
      format: function(values_raw) {
        var days = '';
        _.each(values_raw, function(selected, day) {
          if (selected) days += day.toUpperCase();
        });
        return {days: days};
      },
      values_raw: {
        m: true,
        t: true,
        w: true,
        r: true,
        f: true,
        s: false,
        u: false
      }
    },
    units: {
      description: function(value) {
        return 'Units: ' + value.units;
      },
      format: function(values_raw) {
        var units = [];
        _.each(values_raw, function(selected, unit) {
          if (selected) units.push(unit);
        });
        units = units.join(',');
        return {units: units};
      },
      values_raw: {
        0: false,
        1: true,
        2: true,
        3: true,
        4: true,
        5: true,
        6: false
      }
    }
  };
  _.each($scope.asearch, function(field, id) {
    field.id = id;
    field.active = false;
    if (!field.values_raw) field.values_raw = {};
    field.value = {};
    field.rtsearch = function(a,b) { $scope.rtsearch(a,b,id); };
  });


  // realtime search for typeahead
  $scope.rtsearch = function(query, callback, field) {
    var url = '/rt_search?' + field + '=' + query;
    $http.get(url).success(function(res) {
      callback(res);
    });
  };


  // advanced search results view variables
  $scope.search_results = {};
  $scope.search_results.search_performed = false;
  $scope.search_results.instructions = true;


  // disable 'add search results' button if parameters change
  $scope.$watch('asearch', function() {
    $scope.search_results.search_performed = false;
  }, true);


  // perform advanced search
  $scope.advanced_search = function() {
    var url = '/advanced_search?';

    // for each field
    _.each($scope.asearch, function(field) {
      // if field is active
      if (field.active) {
        // format if there is extra formatting rule
        if (field.format) field.value = field.format(field.values_raw);

        // add search parameters
        _.each(field.value, function(value, key) {
          url += '&' + key + '=' + value;
        });
      }
    });

    // do search and show search results
    $http.get(url).success(function(res) {
      $scope.search_results.sections = $scope.formatSections(res);
      $scope.search_results.url = url;

      $scope.search_results.search_performed = true;
      $scope.search_results.instructions = false;

      $('div.results').scrollTop(0);

      GoogleAnalyticsService.send('search.advanced', $scope.search_results.sections.length);
    });
  };


  // add the advanced search results to the main interface
  $scope.addSearchToCourses = function() {
    var name = 'Advanced Search';
    var tags = $scope.advancedSearchTags();

    $scope.search($scope.search_results.url, {name: name, tags: tags}, []);

    $('#search').modal('hide');
    scrollToTop();
  };


  // reset the advanced search and remove the results
  $scope.resetAdvancedSearch = function() {
    _.each($scope.asearch, function(field) {
      field.active = false;
    });

    $scope.search_results.sections = [];
    $scope.search_results.search_performed = false;
    $scope.search_results.instructions = true;
  };


  // build text tags of advanced search
  $scope.advancedSearchTags = function() {
    var tags = [];

    // for each field
    _.each($scope.asearch, function(field) {
      // if field is active
      if (field.active) {
        var description = field.description(field.value);
        if (description) tags.push(description);
      }
    });

    return tags;
  };


  // add extra properties an array of sections
  $scope.formatSections = function(sections) {
    _.each(sections, function(section) {
      // compute values
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
    });

    return sections;
  };


  // perform the search and addition of courses based on the url
  $scope.search = function(url, properties, selected_sections) {
    // prevent duplicate searches
    // todo alert user if it's a duplicate search instead of silently failing
    if (_.where($scope.courses, {url: url}).length == 0) {
      $http.get(url).success(function(res) {
        var course = {
          sections: $scope.formatSections(res),
          number: _.size($scope.courses),
          url: url,
          show: true
        };
        course = _.extend(course, properties);

        _.each(course.sections, function(section) {
          if (_.contains(selected_sections, section.id)) section.selected = true;
        });

        $scope.courses.push(course);
      });
    }
  };


  // typeahead search function
  $scope.addCourseTextSearch = function(query) {
    return $.map(js_courses, function(course) {
      return course;
    });
  };


  // typeahead selection listener
  $scope.$on('typeahead-updated', function() {
    // reset input
    $scope.addCourseText = '';
    $('[ng-model="addCourseText"]').focus();
  });


  // typeahead
  $scope.$watch('addCourseText', function(new_v, old_v) {
    // if there's a length difference of more than one since last update
    if (new_v && old_v) {
      if (new_v.length > old_v.length + 2) {
        var name = $scope.addCourseText.split(' - ')[0];
        var url = '/search?name=' + name;

        $scope.search(url, {name: name});

        GoogleAnalyticsService.send('search.normal');
      }
    }
  });


  // remove course on delete button click
  $scope.removeCourse = function(course) {
    var a = course.number;
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
              if (valid == false) conflicting_section = section2;
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
      if (valid == false) section.invalidbecause = 'Conflicts with ' + conflicting_section.name;

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


  // check for full/closed sections that have been added
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


  // clear localstorage if data structure has changed
  if (!store.get('version') || store.get('version') < js_version) {
    store.remove('courses');
    store.set('version', js_version);
  }


  // load from localstorage
  if (store.enabled && store.get('courses')) {
    var courses = store.get('courses');

    _.each(courses, function(course) {
      $scope.search(course.url, {name: course.name, tags: course.tags}, course.selected_sections);
    });

    if (courses.length) GoogleAnalyticsService.send('search.localstorage', courses.length);
  }


  // save to localstorage
  $scope.$watch('courses', function(courses) {
    courses = _.map(courses, function(course) {
      course.selected_sections = _.chain(course.sections)
        .filter(function(section) {
          return section.selected;
        })
        .pluck('id')
        .value();

      course = {
        url: course.url,
        name: course.name,
        tags: course.tags,
        selected_sections: course.selected_sections,
        show: course.show
      };
      return course;
    });

    store.set('courses', courses);
    console.log('saved courses', courses);
  }, true);


  // load advanced search examples
  $scope.loadExample = function(example) {
    // reset search
    $scope.resetAdvancedSearch();

    if (example === 1) {
      // activate fields
      $scope.asearch.department.active = true;
      $scope.asearch.seats.active = true;
      $scope.asearch.time_start.active = true;
      $scope.asearch.days.active = true;

      // set field values
      $scope.asearch.department.value.department = 'ENGL';

      $scope.asearch.time_start.values_raw.ba = 'a';
      $scope.asearch.time_start.values_raw.time = '10:00 AM';

      $scope.asearch.days.values_raw.m = true;
      $scope.asearch.days.values_raw.t = false;
      $scope.asearch.days.values_raw.w = true;
      $scope.asearch.days.values_raw.r = false;
      $scope.asearch.days.values_raw.f = true;
      $scope.asearch.days.values_raw.s = false;
      $scope.asearch.days.values_raw.u = false;
    }
  };
}]);
