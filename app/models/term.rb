class Term < ActiveRecord::Base
  attr_accessible :name, :number

  def self.term
    self.first.number
  end

  def self.quarter
    self.first.name
  end
end
