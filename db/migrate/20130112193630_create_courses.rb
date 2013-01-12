class CreateCourses < ActiveRecord::Migration
  def change
    create_table :courses do |t|
      t.string :name
      t.string :fullname
      t.string :instructors
      t.integer :seats

      t.timestamps
    end
  end
end
