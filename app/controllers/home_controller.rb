class HomeController < ApplicationController
  def index
    # calculate min and max hours for each day
    @hour_min = (Course.where('time_start > 400').minimum('time_start') / 100).floor
    @hour_max = (Course.maximum('time_start') / 100).ceil
    @hours = (@hour_min..@hour_max).to_a
    @days = {:M => 'Monday', :T => 'Tuesday',:W => 'Wednesday',:R => 'Thursday',:F => 'Friday',:S => 'Saturday',:U => 'Sunday',}


  end
end