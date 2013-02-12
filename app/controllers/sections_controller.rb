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
end
