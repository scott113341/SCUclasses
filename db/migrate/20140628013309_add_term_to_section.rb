class AddTermToSection < ActiveRecord::Migration
  def change
    add_column :sections, :term_id, :integer
  end
end
