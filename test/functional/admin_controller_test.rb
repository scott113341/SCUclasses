require 'test_helper'

class AdminControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
  end

  test "should get update_courses" do
    get :update_courses
    assert_response :success
  end

end
