require 'rest-client'
require 'nokogiri'
require 'ruby-progressbar'
require 'scuclasses_platform/util'


task :update_sections => :environment do
  start = Time.now
  puts "#{Section.count} existing sections"
  newsections = 0

  # get section list
  url = "http://www.scu.edu/courseavail/search/index.cfm?fuseAction=search&StartRow=1&MaxRow=4000&acad_career=all&school=&subject=&catalog_num=&instructor_name1=&days1=&start_time1=&start_time2=23&header=yes&footer=yes&term=#{TERM}"
  res = RestClient::Request.execute(:method => :get, :url => url, :timeout => 200)
  res = Nokogiri.HTML(res)

  # parse, set, and save section list
  res.css('#zebra tr').each do |section|
    if section.css('td').length == 8
      id = section.css('td')[1].text.to_i

      # parse date and time
      scheduletext = section.css('td')[4].text.strip

      # check that schedule is defined
      if scheduletext == '-'
        days = ''
        time_start = 0
        time_end = 0
      else
        days = (a = /([MTWRFSU]+)\s/.match(scheduletext)) ? a[1] : nil
        times = /(\d{2}:\d{2}\s[APM]{2})-(\d{2}:\d{2}\s[APM]{2})/.match(scheduletext)

        # check that time is well-formed
        if days != nil && times != nil
          time_start = Util.parse_time(times[1])
          time_end = Util.parse_time(times[2])
        else
          days = ''
          time_start = 0
          time_end = 0
        end
      end

      # create new or update existing
      if Section.exists?(id)
        thissection = Section.find(id)
      else
        thissection = Section.new
        newsections += 1
      end

      # set section properties
      thissection.id = id
      thissection.name = section.css('td')[0].text.strip
      thissection.fullname = section.css('td')[3].text.strip.gsub(/\s{2,}/, ' ')
      thissection.seats = section.css('td')[7].text.to_i
      thissection.instructors = section.css('td')[6].text.strip
      thissection.days = days
      thissection.time_start = time_start
      thissection.time_end = time_end
      thissection.save
      thissection.touch
    end
  end

  # remove sections that don't exist anymore
  todelete = Section.where('updated_at < ?', Time.now - 2.5*60*60) # 2.5 hour grace period
  puts "#{todelete.length} sections deleted"
  todelete.destroy_all

  puts "#{Section.count} sections updated"
  puts "#{newsections} new sections"

  Rake::Task['update_sections_details'].execute
  Rake::Task['update_core_keys'].execute
  Rake::Task['update_term'].execute

  puts "update took #{((Time.now - start)/60).round(2)} minutes"
end





task :update_sections_details => :environment do
  sections = Section.all

  progress = ProgressBar.create(
      :title => 'section details',
      :total => sections.length,
      :format => '%t: |%B| %P%%, %e'
  )

  sections.each do |section|
    # get section details
    res = RestClient.get "http://www.scu.edu/courseavail/class/?fuseaction=details&class_nbr=#{section.id.to_s}&term=#{TERM}"
    res = Nokogiri.HTML(res)

    # parse section details
    res.css('#page-primary tr').each do |detail|
      detail_name = detail.css('th').text.strip
      value = detail.css('td').text.strip

      if 'Description' == detail.css('th').text.strip
        section.description = value.gsub(/\s{2,}/, ' ')
      end

      if detail_name.match(/2009 Core/)
        section.core = value.scan(/\w{1}_\w+/).join(',')
      end

      if 'Units (min/max)' == detail.css('th').text.strip
        section.units = (units = value.scan(/\d/)[0]) ? units : 0;
      end

      if location = detail.css('td')[4]
        section.location = location.text.strip
      end
    end

    section.save

    progress.increment
  end
end





task :update_core_keys => :environment do
  # empty core model
  Core.destroy_all

  # get courseavail landing page
  res = RestClient.get 'http://www.scu.edu/courseavail'
  res = Nokogiri.HTML(res)

  res.css('#newcore option').each do |core_option|
    if core_option.text.length > 0
      core = Core.new
      core.key = core_option.attribute('value').text.strip
      core.name = core_option.text.strip[/^\w+\s\-\s[A-Z]+\s(.+)/, 1].gsub(/PATH/, 'Pathway -')

      core.save
    end
  end
end





task :update_term => :environment do
  # empty term model
  Term.destroy_all

  # get courseavail landing page
  res = RestClient.get 'http://www.scu.edu/courseavail'
  res = Nokogiri.HTML(res)

  # get selected term
  term = res.css('#term option').find do |option|
    not option.attribute('selected').nil?
  end

  Term.create(
    name: term.text.strip,
    number: term.attribute('value').value.to_i
  )
end
