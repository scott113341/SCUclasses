class Course < ActiveRecord::Base
  attr_accessible :fullname, :instructors, :name, :seats
end
