class AdminController < ApplicationController
  def index
  end

  def courses
    @courses = Course.all
  end





  def authenticate
    authenticate_or_request_with_http_basic do |username, password|
      username == "foo" && password == "bar"
    end
  end
end
