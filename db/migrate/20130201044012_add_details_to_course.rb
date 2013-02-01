class AddDetailsToCourse < ActiveRecord::Migration
  def change
    add_column :courses, :description, :text
    add_column :courses, :units, :integer
    add_column :courses, :location, :string
    add_column :courses, :core, :string
  end
end
