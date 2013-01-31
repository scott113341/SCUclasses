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
        days = /([MTWRFSU]+)\s/.match(scheduletext)[1]
        times = /(\d{2}:\d{2}\s[APM]{2})-(\d{2}:\d{2}\s[APM]{2})/.match(scheduletext)

        # check that time is well-formed
        if times != nil
          time_start = parseTime(times[1])
          time_end = parseTime(times[2])
        else
          days = ''
          time_start = 0
          time_end = 0
        end
      end

      # set newcourse properties
      newcourse = Course.new
      newcourse.id = id
      newcourse.name = course.css('td')[0].text.strip
      newcourse.fullname = course.css('td')[3].text.strip
      newcourse.seats = course.css('td')[7].text.to_i
      newcourse.instructors = course.css('td')[6].text.strip
      newcourse.days = days
      newcourse.time_start = time_start
      newcourse.time_end = time_end
      newcourse.save
    end
  end

  print(Course.count, " courses updated\n")
end


def parseTime(time)
  time = /(\d{2}):(\d{2})\s([APM]{2})/.match(time)
  hours = time[1].to_i * 100
  minutes = time[2].to_i
  ampm = time[3]

  time = hours + minutes + ((ampm=='PM' && hours<1200) ? 1200 : 0)
  return time
end
