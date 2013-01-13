task :update_courses => :environment do
  print(Course.count, " existing courses\n")

  # delete courses
  Course.delete_all

  # get course list
  require 'rest-client'
  require 'nokogiri'
  res = RestClient.get('http://www.scu.edu/courseavail/search/index.cfm?fuseAction=search&StartRow=1&MaxRow=3000&term=3420&acad_career=all&school=&subject=&catalog_num=&instructor_name1=&days1=&start_time1=&start_time2=23&header=yes&footer=yes')
  res = Nokogiri.HTML(res)

  # parse, set, and save course list
  res.css('#zebra tr').each do |course|
    if course.css('td').length == 8
      newcourse = Course.new
      newcourse.id = course.css('td')[1].text.to_i
      newcourse.name = course.css('td')[0].text.strip
      newcourse.fullname = course.css('td')[3].text.strip
      newcourse.seats = course.css('td')[7].text.to_i
      newcourse.instructors = course.css('td')[6].text.strip

      # parse date and time
      scheduletext = course.css('td')[4].text.strip
      days = /([MTWRFSU]+)\s/.match(scheduletext)[1]
      times = /(\d{2}:\d{2}\s[APM]{2})-(\d{2}:\d{2}\s[APM]{2})/.match(scheduletext)

      # set date and time
      newcourse.days = days
      newcourse.time_start = Time.parse(times[1])
      newcourse.time_end = Time.parse(times[2])

      newcourse.save
    end
  end

  print(Course.count, " courses updated\n")
end
