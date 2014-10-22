class Section < ActiveRecord::Base
  belongs_to :term

  def self.where_term(term)
    return self.where(term_id: term.id)
  end
end
