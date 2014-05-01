class CreateTerms < ActiveRecord::Migration
  def change
    create_table :terms do |t|
      t.string :name
      t.integer :number

      t.timestamps
    end
  end
end
