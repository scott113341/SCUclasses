class HomeController < ApplicationController
  before_filter :set_term

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
    Section.where_term(@term).select("name, MIN(fullname) AS fullname").group('name').each do |course|
      @js_courses.push(course.name + ' - ' + course.fullname)
    end
    @js_courses.sort! {|a,b| /[0-9]+/.match(a).to_s.to_i + ((/[0-9]+[A-Z]/.match(a)) ? 0.5 : 0) <=> /[0-9]+/.match(b).to_s.to_i + ((/[0-9]+[A-Z]/.match(b)) ? 0.5 : 0)} # sort courses by dept/number

    # javascript core
    @js_core = Core.order(:name).all.map do |core|
      {name: core.key, fullname: core.name}
    end
    pathway = /^Pathway/
    @js_core = @js_core.select{ |c| c[:fullname].match(pathway).nil? } + @js_core.reject{ |c| c[:fullname].match(pathway).nil? } # move the pathway cores to the end

    # last updated
    @lastupdated = ((Time.now - Section.first.updated_at) / 60).ceil

    # readonly if valid sections are specified
    if params[:classes].nil?
      @readonly = false
    else
      @readonly = ! Section.where_term(@term).find(params[:classes].split(',')).nil?
    end
  end



  # section search
  def search
    if params[:name]
      courses = Section.where_term(@term).where('name = ? AND seats > 0', params[:name]).order('time_start')
      courses_noseats = Section.where_term(@term).where('name = ? AND seats = 0', params[:name]).order('time_start')
      courses = (courses + courses_noseats)
    elsif params[:id]
      courses = Section.where_term(@term).find(params[:id])
    elsif params[:core]
      courses = Section.where_term(@term).where('core LIKE ?', '%'+params[:core]+'%')
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

    unless params[:id].blank?
      query += ' AND id = :id'
      queryparams[:id] = params[:id]
    end

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
      time = Util.parse_time(params[:time_start][1..-1])
      query += ' AND time_start'
      query += (before) ? ' <= ' : ' >= '
      query += ':time_start'
      queryparams[:time_start] = time
    end

    unless params[:time_end].blank?
      before = params[:time_end][0] == 'b'
      time = Util.parse_time(params[:time_end][1..-1])
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
      query += ' AND core LIKE :core'
      queryparams['core'] = '%' + params[:core] + '%'
    end

    unless params[:core2].blank?
      query += ' AND core LIKE :core2'
      queryparams['core2'] = '%' + params[:core2] + '%'
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
    sections = Section.where_term(@term).where(query, queryparams.symbolize_keys)

    # render query
    render :json => sections
  end



  # real time search
  def rt_search
    results = []

    if params[:id]
      results = Section.where_term(@term).select('id').where('CAST(id AS TEXT) LIKE ?', "#{params[:id]}%").map{|c| c.id.to_s}
    elsif params[:department]
      results = Section.where_term(@term).select('DISTINCT name').where('name ILIKE ?', "#{params[:department]}%").map{|c| c.name.split(' ')[0]}.uniq()
    elsif params[:instructors]
      results = Section.where_term(@term).select('DISTINCT instructors').where('instructors ILIKE ?', "%#{params[:instructors]}%").map{|c| c.instructors}
    end

    render :json => results
  end



  # export interface for scubooks
  def scubooks
    sections = Section.all
    render json: sections
  end



  def set_term
    if params[:term]
      @term = Term.find(params[:term])
    else
      @term = Term.find_by_default(true)
    end
  end
end
