class AdminController < ApplicationController
  def index
  end

  def courses
    @courses = Course.all

    respond_to do |format|
      format.html
      format.json { render :json => @courses }
    end
  end

  def course
    course = Course.where('name = ?', params[:name])

    respond_to do |format|
      format.json { render :json => course }
    end
  end
end
