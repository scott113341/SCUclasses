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



  # section search
  def search
    if params[:name]
      courses = Section.where('name = ? AND seats > 0', params[:name]).order('time_start')
      courses_noseats = Section.where('name = ? AND seats = 0', params[:name]).order('time_start')
      courses = (courses + courses_noseats)
    elsif params[:id]
      courses = Section.find(params[:id])
    elsif params[:core]
      courses = Section.where('core LIKE ?', '%'+params[:core]+'%')
    else
      courses = []
    end

    render :json => courses
  end



  def export
    require 'csv'

    # get sections
    sections = params[:sections].split(',')

    # make csv
    csv = CSV.generate do |csv|
      csv << ['Class', 'Name', 'Class ID', 'Seats Remaining', 'Professor', 'Days', 'Times', 'Location', 'Units']
      Section.find(sections).each do |section|
        # format the time
        s = section.time_start.to_i
        e = section.time_end.to_i
        times = []
        [s,e].each do |t|
          time = ((t/100).floor > 12) ? (((t/100).floor - 12).to_s + ':' + (t-(t/100).floor*100).to_s.rjust(2,'0') + 'pm') : (((t/100).floor).to_s+':'+(t-(t/100).floor*100).to_s.rjust(2,'0') + 'am')
          times << time
        end
        times = times.join(' - ')

        # push to csv
        csv << section.attributes.values_at('name', 'fullname', 'id', 'seats', 'instructors', 'days') + [times] + section.attributes.values_at('location', 'units')
      end
    end

    send_data csv, :filename => 'Schedule.csv'
  end



  # export interface for scubooks
  def scubooks
    sections = Section.all
    render json: sections
  end
end
