class CoursesController < ApplicationController
  def courses
    if params[:name]
      #courses = Course.where('name = ? AND fullname NOT LIKE ?', params[:name], '%lab%')
      courses = Course.where('name = ?', params[:name]).order('time_start')
    elsif params[:id]
      courses = Course.find(params[:id])
    elsif params[:core]
      courses = Course.where('core LIKE ?', '%'+params[:core]+'%')
    else
      courses = []
    end

    render :json => courses
  end
end
