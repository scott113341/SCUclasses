require 'json'

class Util
  def self.parse_time(time)
    time = /(\d{2}):(\d{2})\s([APM]{2})/.match(time)
    hours = time[1].to_i * 100
    minutes = time[2].to_i
    ampm = time[3]

    time = hours + minutes + ((ampm=='PM' && hours<1200) ? 1200 : 0)
    return time
  end

  def self.parse_bad_json(bad_json)
    bad_json = JSON.parse(bad_json)
    json = []

    bad_json['DATA'].each do |data|
      record = {}
      bad_json['COLUMNS'].each_with_index do |column, i|
        key = column.downcase
        record[key] = data[i]
      end
      json.push(record)
    end

    return json
  end

  def self.current_term
    year = Time.now.year - 2013 + 3500
  end

  def self.terms

  end
end
