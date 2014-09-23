class AddDefaultToTerm < ActiveRecord::Migration
  def change
    add_column :terms, :default, :boolean
  end
end
