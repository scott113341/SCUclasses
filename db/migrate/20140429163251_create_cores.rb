class CreateCores < ActiveRecord::Migration
  def change
    create_table :cores do |t|
      t.string :key
      t.string :name

      t.timestamps
    end
  end
end
