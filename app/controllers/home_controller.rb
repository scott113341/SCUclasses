class HomeController < ApplicationController
  def index
    # calculate min and max hours for each day
    hour_min = 7
    hour_max = 9 + 12
    @hours = (hour_min..hour_max).to_a
    @days = {
        :M => 'Monday',
        :T => 'Tuesday',
        :W => 'Wednesday',
        :R => 'Thursday',
        :F => 'Friday',
        :S => 'Saturday',
        :U => 'Sunday',
    }

    # javascript course list (array of course.name)
    @js_courses = []
    Section.select("name, MIN(fullname) AS fullname").group('name').each do |course|
      @js_courses.push(course.name + ' - ' + course.fullname)
    end
    @js_courses.sort! {|a,b| /[0-9]+/.match(a).to_s.to_i + ((/[0-9]+[A-Z]/.match(a)) ? 0.5 : 0) <=> /[0-9]+/.match(b).to_s.to_i + ((/[0-9]+[A-Z]/.match(b)) ? 0.5 : 0)} # sort courses by dept/number

    # last updated
    @lastupdated = ((Time.now - Section.first.updated_at) / 60).ceil
  end
end
