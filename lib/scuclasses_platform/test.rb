require_relative 'util'

puts Util.parse_bad_json('{"COLUMNS":["STRM","STRM_DESCR"],"DATA":[[3600,"Fall 2014"],[3540,"Spring 2014"],[3520,"Winter 2014"],[3500,"Fall 2013"]]}')
