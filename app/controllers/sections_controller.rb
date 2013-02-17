class SectionsController < ApplicationController
  def sections
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
        #if (!times) then times = 'undefined'

        # push to csv
        csv << section.attributes.values_at('name', 'fullname', 'id', 'seats', 'instructors', 'days') + [times] + section.attributes.values_at('location', 'units')
      end
    end

    send_data csv, :filename => 'Schedule.csv'
  end
end
