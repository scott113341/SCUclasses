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



  # advanced search
  def advanced_search
    # sql query and parameters
    query = 'id != 0'
    queryparams = {}

    unless params[:name].blank?
      query += ' AND name = :name'
      queryparams[:name] = params[:name]
    end

    unless params[:fullname].blank?
      query += ' AND fullname = :fullname'
      queryparams[:fullname] = params[:fullname]
    end

    unless params[:instructors].blank?
      query += ' AND instructors = :instructors'
      queryparams[:instructors] = params[:instructors]
    end

    unless params[:seats].blank?
      query += ' AND seats > :seats'
      queryparams[:seats] = 0
    end

    unless params[:days].blank?
      query += ' AND days IN (:days)'
      queryparams[:days] = ['']
      queryparams[:days].concat params[:days].chars.to_a &:join
      queryparams[:days].concat params[:days].chars.to_a.combination(2).map &:join
      queryparams[:days].concat params[:days].chars.to_a.combination(3).map &:join
    end

    unless params[:time_start].blank?
      before = params[:time_start][0] == 'b'
      time = parse_time(params[:time_start][1..-1])
      query += ' AND time_start'
      query += (before) ? ' <= ' : ' >= '
      query += ':time_start'
      queryparams[:time_start] = time
    end

    unless params[:time_end].blank?
      before = params[:time_end][0] == 'b'
      time = parse_time(params[:time_end][1..-1])
      query += ' AND time_end'
      query += (before) ? ' <= ' : ' >= '
      query += ':time_end'
      queryparams[:time_end] = time
    end

    unless params[:units].blank?
      query += ' AND units IN (:units)'
      queryparams[:units] = params[:units].split(',')
    end

    unless params[:core].blank?
      query += " AND (core NOT LIKE 'z'"
      params[:core].split(',').each_with_index do |core, i|
        query += ' AND core LIKE :core' + i.to_s
        queryparams['core' + i.to_s] = '%' + core + '%'
      end
      query += ')'
    end

    unless params[:department].blank?
      query += ' AND name LIKE :department'
      queryparams[:department] = params[:department] + '%'
    end

    # exclude non-timed classes
    unless params[:time_end].blank? && params[:time_start].blank?
      query += ' AND time_start != 0'
      query += ' AND time_end != 0'
    end

    # execute query
    if params[:id].blank?
      sections = Section.where(query, queryparams.symbolize_keys)
    else
      sections = Section.where('id = ?', params[:id])
    end

    # render query
    render :json => sections
  end



  # real time search
  def rt_search
    results = []

    if params[:id]
      results = Section.select('id').where('id LIKE ?', params[:id]+'%').map{|course| course.id.to_s}
    elsif params[:department]
      results = Section.select('DISTINCT name').where('name LIKE ?', params[:department]+'%').map{|course| course.name.split(' ')[0]}.uniq()
    end

    render :json => results
  end



  # csv export
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
