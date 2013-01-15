$(function() {
    $('#course-add').typeahead({
        source: js_courses,
        items: 10,
        updater: function(item) {
            if (_.contains(js_courses, item)) {
                $.ajax({
                    url: '/admin/course/' + item + '.json',
                    success: function(courses) {
                        console.log(courses)

                        var context = {
                            courses: courses,
                        }

                        renderBars('#courses-added-template', context, '#courses-added');
                    },
                });
            }
        }
    });


    $('.course-evaluation').live('click', function(e) {
        $('#course-evaluation-form').find('input').val($(this).text());
        $('#course-evaluation-form').submit();
    });
});


function renderBars(template_id, context, target) {
    var source = $(template_id).html();
    var template = Handlebars.compile(source);
    $(target).html(template(context));
}