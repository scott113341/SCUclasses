task :update_courses => :environment do
  print(Course.count, " existing courses\n")

  # get course list
  require 'rest-client'
  require 'nokogiri'
  res = RestClient.get('http://www.scu.edu/courseavail/search/index.cfm?fuseAction=search&StartRow=1&MaxRow=4000&acad_career=all&school=&subject=&catalog_num=&instructor_name1=&days1=&start_time1=&start_time2=23&header=yes&footer=yes&term=' + TERM)
  res = Nokogiri.HTML(res)
  Course.delete_all

  # parse, set, and save course list
  res.css('#zebra tr').each do |course|
    if course.css('td').length == 8
      id = course.css('td')[1].text.to_i

      # parse date and time
      scheduletext = course.css('td')[4].text.strip
      if scheduletext == '-'
        days = ''
        time_start = 0
        time_end = 0
      else
        days = (a = /([MTWRFSU]+)\s/.match(scheduletext)) ? a[1] : nil
        times = /(\d{2}:\d{2}\s[APM]{2})-(\d{2}:\d{2}\s[APM]{2})/.match(scheduletext)

        # check that time is well-formed
        if days != nil && times != nil
          time_start = parseTime(times[1])
          time_end = parseTime(times[2])
        else
          days = ''
          time_start = 0
          time_end = 0
        end
      end

      # create new or update existing
      if Course.exists?(id)
        thiscourse = Course.find(id)
      else
        thiscourse = Course.new
      end

      # set course properties
      thiscourse.id = id
      thiscourse.name = course.css('td')[0].text.strip
      thiscourse.fullname = course.css('td')[3].text.strip
      thiscourse.seats = course.css('td')[7].text.to_i
      thiscourse.instructors = course.css('td')[6].text.strip
      thiscourse.days = days
      thiscourse.time_start = time_start
      thiscourse.time_end = time_end
      thiscourse.save
    end
  end

  print(Course.count, " courses updated\n")

  Rake::Task['update_courses_details'].execute
end


def parseTime(time)
  time = /(\d{2}):(\d{2})\s([APM]{2})/.match(time)
  hours = time[1].to_i * 100
  minutes = time[2].to_i
  ampm = time[3]

  time = hours + minutes + ((ampm=='PM' && hours<1200) ? 1200 : 0)
  return time
end










task :update_courses_details => :environment do
  courses = Course.all
  i = 1

  courses.each do |course|
    # get course details
    require 'rest-client'
    require 'nokogiri'
    res = RestClient.get('http://www.scu.edu/courseavail/class/?fuseaction=details&class_nbr=' + course.id.to_s + '&term=' + TERM)
    res = Nokogiri.HTML(res)

    # parse course details
    res.css('#page-primary tr').each do |detail|
      detail_name = detail.css('th').text.strip
      value = detail.css('td').text.strip

      if 'Description' == detail.css('th').text.strip
        course.description = value
      end

      if detail_name.match(/2009 Core/)
        course.core = value.scan(/\w{1}_\w+/).join(',')
      end

      if 'Units (min/max)' == detail.css('th').text.strip
        course.units = value.scan(/\d/)[0]
      end

      if location = detail.css('td')[4]
        course.location = location.text.strip
      end
    end

    course.save

    print("course ",i," of ",courses.length,"\n")
    i += 1
  end
end
