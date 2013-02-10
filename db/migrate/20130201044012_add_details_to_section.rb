class AddDetailsToSection < ActiveRecord::Migration
  def change
    add_column :sections, :description, :text
    add_column :sections, :units, :integer
    add_column :sections, :location, :string
    add_column :sections, :core, :string
  end
end
