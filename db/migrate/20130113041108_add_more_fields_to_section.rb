class AddMoreFieldsToSection < ActiveRecord::Migration
  def change
    add_column :sections, :days, :string
    add_column :sections, :time_start, :integer
    add_column :sections, :time_end, :integer
  end
end
