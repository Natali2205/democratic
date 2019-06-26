$(function() {
	$lang = getCookie("lang");
	if ($lang !== null) {
		$lang = $lang.replace("_", "-");
	} else {
		$lang = "RU";
	}

	$.datepicker.setDefaults($.datepicker.regional[$lang]);
	var dateToday = new Date();

	var dates = $('#createDate, #modificationDate')
			.datepicker(
					{
						onSelect : function(selectedDate) {
							instance = $(this).data(
									"datepicker"), date = $.datepicker
									.parseDate(
											instance.settings.dateFormat
													|| $.datepicker._defaults.dateFormat,
											selectedDate, instance.settings);
							dates.not(this).datepicker(date);
						},
						beforeShow : function() {
							setTimeout(function(){
								$('.ui-datepicker').css('z-index', 10);
							}, 0);
						}
					});
});

DATA_PICK = {
	initOnSelector : function(selector) {
		var dates = $(selector).on("keydown", function(e) {
			e.preventDefault();
		}).datepicker({
			onSelect : function(selectedDate) {
				var instance = $(this).data("datepicker");
					date = $.datepicker.parseDate(
						instance.settings.dateFormat || $.datepicker._defaults.dateFormat,
						selectedDate, instance.settings
					);
				dates.not(this).datepicker(date);
			},
			beforeShow : function() {
				setTimeout(function() {
					$('.ui-datepicker').css('z-index', 2000);
				}, 0);
			}
		});
	}
}