class SectionsController < ApplicationController
  def sections
    if params[:name]
      courses = Section.where('name = ?', params[:name]).order('time_start')
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
