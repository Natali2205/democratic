var AJAXs = {
	getCustom : function (url, data) {
		var promise = $.Deferred();
		$.ajax({
			type: 'GET',
			url: url,
			data: data,
			cache: false,
			success: function(data) {
				AJAXs.baseSuccessHandler(promise, data);
			},
			error: function(data) {
				promise.reject(data);
			}
		});
		return promise;
	},

	postCustom : function ($form, url, data) {
		var promise = $.Deferred(),
			url = url || $form.action || $form[0].action,
			data = data || $form.serialize();
		$.ajax({
			type: 'POST',
			url: url,
			data: data,
			success: function(data) {
				AJAXs.baseSuccessHandler(promise, data);
			},
			error: function(data) {
				promise.reject(data);
			}
		});
		return promise;
	},

	postWithCsrf : function(csrfObj, url, data) {
		if (!AJAXs.isCsrfObjCorrect(csrfObj)) return false;
		var promise = $.Deferred();
		$.ajax({
			type: 'POST',
			url: url,
			data: data,
			beforeSend : function(xhr) {
				xhr.setRequestHeader(csrfObj.header, csrfObj.token);
			},
			success: function(data) {
				AJAXs.baseSuccessHandler(promise, data);
			},
			error: function(data) {
				promise.reject(data);
			}
		});
		return promise;
	},

	postFileInForm : function ($form, url) {
		var promise = $.Deferred(),
			url = url || $form.action || $form[0].action,
			data = new FormData($form[0]);
		$.ajax({
			type: 'POST',
			url: url,
			data: data,
			enctype: 'multipart/form-data',
			processData: false,
			contentType: false,
			cache: false,
			success: function(data) {
				AJAXs.baseSuccessHandler(promise, data);
			},
			error: function(data) {
				promise.reject(data);
			}
		});
		return promise;
	},

	postFileWithFormData : function (csrfObj,formData , url) {
		if (!AJAXs.isCsrfObjCorrect(csrfObj)) return false;
		var promise = $.Deferred();
		$.ajax({
			type: 'POST',
			url: url,
			data: formData,
			enctype: 'multipart/form-data',
			processData: false,
			contentType: false,
			cache: false,
			beforeSend : function(xhr) {
				xhr.setRequestHeader(csrfObj.header, csrfObj.token);
			},
			success: function(data) {
				AJAXs.baseSuccessHandler(promise, data);
			},
			error: function(data) {
				promise.reject(data);
			}
		});
		return promise;
	},

	deleteWithCsrf : function(csrfObj, url) {
		if (!AJAXs.isCsrfObjCorrect(csrfObj)) return false;
		var promise = $.Deferred();
		$.ajax({
			type: 'DELETE',
			url: url,
			beforeSend : function(xhr) {
				xhr.setRequestHeader(csrfObj.header, csrfObj.token);
			},
			success: function(data) {
				AJAXs.baseSuccessHandler(promise, data);
			},
			error: function(data) {
				promise.reject(data);
			}
		});
		return promise;
	},

	isCsrfObjCorrect : function(csrfObj) {
		if ($.isEmptyObject(csrfObj) && !csrfObj.hasOwnProperty('header') && !csrfObj.hasOwnProperty('token')) {
			alert("csrf can't be empty or corrupted!");
			return false;
		}
		return true;
	},

	baseSuccessHandler: function(promise, data) {
		if (data.status === "success") {
			promise.resolve(data);
		} else {
			promise.reject(data);
		}
	},
}