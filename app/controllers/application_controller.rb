class ApplicationController < ActionController::Base
  protect_from_forgery

  def parse_time(time)
    time = /(\d{2}):(\d{2})\s([APM]{2})/.match(time)
    hours = time[1].to_i * 100
    minutes = time[2].to_i
    ampm = time[3]

    time = hours + minutes + ((ampm=='PM' && hours<1200) ? 1200 : 0)
    return time
  end
end
