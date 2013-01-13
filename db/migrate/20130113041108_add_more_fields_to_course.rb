class AddMoreFieldsToCourse < ActiveRecord::Migration
  def change
    add_column :courses, :days, :string
    add_column :courses, :time_start, :time
    add_column :courses, :time_end, :time
  end
end
