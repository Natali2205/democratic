/** 
 * Init datepicker for sd
 **/
$(function() {
	DATA_PICK.initOnSelector("#regDate, #applyCourtDate, #applySubpoenaDate");
});

/** 
 * Init and customize wizard sd form
 **/
$(function($) {
	$('#wizard').wizard({
		step: WIZARD_UTILS.stepSelector,
		templates: {
			buttons: WIZARD_UTILS.buttons
		},
		getPane: function(index, step) {
			return this.$element.find('.wp-data-right-container>form>.wizard-pane').eq(index);
		},
		pane: {
			active: 'active',
			activing: 'activing'
		},
		enableWhenVisited: true,
		enableDisablingButtons: true,
		autoFocus: false,
		buttonLabels: WIZARD_UTILS.buttonLabels,
		onFinish: function() {
			WIZARD_UTILS.wizardFinishValidator("litigationDTO", "#applyCourtDate, #applySubpoenaDate");
		}

	});
});
/**
 * Handlers and upd. for wizard litigation form
 * */
$(document).ready(function() {
	$("#courtId")
		.attr("data-size", "5")
		.attr("data-live-search", "true")
		.attr("data-live-search-normalize", "true")
		.selectpicker();

	$("#litigationDTO").on("click", ".participant-delete", function(e) {
		var participantId = $(this).data("participant-id"),
			$participantHolder = $(this).parent();
		LITIG_UTILS.deleteParticipant(participantId, $participantHolder);
	}).on("click", ".image-delete", function(e) {
		var imageLongId = $(this).data("image-id"),
			$imageHolder = $(this).parent();
		IMAGE_UP_UTILS.deleteImage(imageLongId, $imageHolder);
	});
});

LITIG_UTILS = {
	serverUrl : "",
	longId : null,
	$litigForm : null,
	inProgress : false,

	init : function(serverUrl, longId) {
		LITIG_UTILS.serverUrl = serverUrl;
		LITIG_UTILS.longId = longId;
		LITIG_UTILS.$litigForm = $("#litigationDTO");
		WIZARD_UTILS.errorAnalyzer();
	},

	deleteParticipant : function(participantId, $participantHolder) {
		var deleteObj = {
				title : LANG.confirmation,
				message : "Вы действительно желаете удалить участника?",
				btnConfirmAction : new goDelete(participantId, $participantHolder)
			}
		var confirmDialog = new DIALOG_FORM.DIALOG_BASE_CONFIRM(deleteObj);
		new BootstrapDialog.show(confirmDialog);

		function goDelete(participantId, $participantHolder) {
			var that = this;
			this.participantId = participantId;
			this.$participantHolder = $participantHolder;
			return function() {
				var url = LITIG_UTILS.serverUrl + 'ajax/participant/legal/' + that.participantId,
					csrfObj = {
						token : $("meta[name='_csrf']").attr("content"),
						header : $("meta[name='_csrf_header']").attr("content")
					};
				AJAXs.deleteWithCsrf(csrfObj, url)
					.done(function (data) {
						that.$participantHolder.detach();
					}).fail(function(data) {
						handlerAjaxFailWithAlertDialog(data);
					});
				}
		};
	},

	addPopover : function() {
		$(".part-popover").popover({
			html : 'true',
			trigger : 'toggle',
			content : function () {
						var pRole = this.getAttribute("data-role"),
							content = ['<a href="javascript:void(0)" class="btn-make-dialog col-sm-3 btn btn-in-form btn-aqua normalized-text"', 
										'data-dialog-css-class="dialog-participant dialog-participant-physical"',
										'data-dialog-load-url="', LITIG_UTILS.serverUrl, 'ajax/participant/physical/create"',
										'data-dialog-title="Добавить ФЛ"',
										'data-dialog-custom-role="', pRole, '"',
										'data-dialog-request-action="add">',
									'Добавить ФЛ',
								'</a>',
								'<a href="javascript:void(0)" class="btn-make-dialog col-sm-3 btn btn-in-form btn-aqua normalized-text"',
										'data-dialog-css-class="dialog-participant dialog-participant-legal"',
										'data-dialog-load-url="', LITIG_UTILS.serverUrl, 'ajax/participant/legal/create"',
										'data-dialog-title="Добавить ЮЛ"',
										'data-dialog-custom-role="', pRole, '"',
										'data-dialog-request-action="add">',
									'Добавить ЮЛ',
								'</a>'].join("")
						return content;
					}
		});
	},

	setOwner : function() {
		if (LITIG_UTILS.inProgress) return false;
		LITIG_UTILS.inProgress = true;
		var url = LITIG_UTILS.serverUrl + "ajax/litigation/owner",
			csrfObj = {
				token : $("meta[name='_csrf']").attr("content"),
				header : $("meta[name='_csrf_header']").attr("content")
			},
			dataObj = {
				longId : LITIG_UTILS.longId
		};
		AJAXs.postWithCsrf(csrfObj, url, dataObj)
			.done(function(data) {
				DIALOG_FORM.infoMessage("Документ успешно привязан к текущему пользователю");
				$("#saveLitig").parent().detach();
			}).fail(function(data) {
				handlerAjaxFailWithAlertDialog(data)
			}).always(function() {
				LITIG_UTILS.inProgress = false;
			});
	}
	
}

PARTICIPANT_UTILS = {
	participantId : null,
	participantType : "legal",
	$participantEl : null,
	$roleEl : null,
	$currentRole : null,
	$modalContent : null,
	$entBlocks : null,
	serverUrl : "",
	changeRoleUrl : "",
	heightModalLegalHight : "435px",
	heightModalLegalBase : "395px",
	heightModalPhysicalHight : "690px",
	heightModalPhysicalBase : "650px",
	heightModalPhysicalHightEnt : "770px",
	heightModalPhysicalBaseEnt : "730px",

	init : function(serverUrl, participantId, participantType) {
		PARTICIPANT_UTILS.serverUrl = serverUrl;
		PARTICIPANT_UTILS.$roleEl = $("#role");
		PARTICIPANT_UTILS.$modalContent = $(".modal-content");
		PARTICIPANT_UTILS.$entBlocks = $(".isEnt");
		PARTICIPANT_UTILS.participantId = participantId;
		PARTICIPANT_UTILS.participantType = participantType;
		PARTICIPANT_UTILS.currentRole = PARTICIPANT_UTILS.$roleEl.val();
		PARTICIPANT_UTILS.changeRoleUrl = PARTICIPANT_UTILS.serverUrl + "ajax/participant/" + PARTICIPANT_UTILS.participantType + "/role";
		PARTICIPANT_UTILS.dialogAdjustHeight();
	},

	setCurrentRole : function(role) {
		PARTICIPANT_UTILS.$roleEl.val(role.toUpperCase());
		PARTICIPANT_UTILS.currentRole = role;
	},

	getCurrentRoleLow : function() {
		return PARTICIPANT_UTILS.currentRole.toLowerCase()
	},

	buildParticipantEl : function() {
		PARTICIPANT_UTILS.$participantEl = $("#" + PARTICIPANT_UTILS.getCurrentRoleLow() + "_" + PARTICIPANT_UTILS.participantType + "_" + PARTICIPANT_UTILS.participantId);
	},

	updateParticipantEl : function(newRole) {
		PARTICIPANT_UTILS.$participantEl.attr("id", PARTICIPANT_UTILS.getCurrentRoleLow() + "_" + PARTICIPANT_UTILS.participantType + "_" + PARTICIPANT_UTILS.participantId);
	},

	updateWithNewRole : function(newRole) {
		PARTICIPANT_UTILS.$participantEl.detach();
		$("#litigationDTO").find("#" + newRole + "_list").append(PARTICIPANT_UTILS.$participantEl);
		PARTICIPANT_UTILS.setCurrentRole(newRole);
		PARTICIPANT_UTILS.updateParticipantEl();
	},

	updateParticipant : function($formDto, dialogAction) {
		var that = this;
		this.$formDto = $formDto;
		this.dialogAction = dialogAction;
		return function() {
			var $litig = $("#litigationDTO"),
				$participant = that.$formDto;
			if ($litig.length !== 1) {
				alert("Litigation not found!");
				return false;
			}
			if ($participant.length !== 1) {
				alert("Form Participant not found!");
				return false;
			}
			var role = $participant.find("#role").val().toLowerCase(),
				fullName = PARTICIPANT_UTILS.getParticipantFullName($participant),
				phone = $participant.find("#mobilePhone").val() || $participant.find("#fixedPhone").val();
			if (that.dialogAction === "add") {
				PARTICIPANT_UTILS.buildParticipantInfo(fullName, phone);
			} else {
				PARTICIPANT_UTILS.$participantEl.find(".wp-data-info-desc").text(fullName);
			}
			DIALOG_INSTANCE.close()
		}
	},

	buildParticipantInfo : function(fullName, phone) {
		var $divHold = $('<div/>').addClass("wp-data-row wp-data-row-litig").attr("id", PARTICIPANT_UTILS.getCurrentRoleLow() + "_" + PARTICIPANT_UTILS.participantType + "_" + PARTICIPANT_UTILS.participantId),
			$divHdr = $('<div/>').addClass("wp-data-info-hdr"),
			$divDesc = $('<div/>').addClass("wp-data-info-desc normalized-text").text(fullName),
			$place = $("#" + PARTICIPANT_UTILS.getCurrentRoleLow() + "_list"),
			$aEdit = buildEditBtn();
			$aDelete = buildDeleteBtn();

		$divHdr.text(PARTICIPANT_UTILS.participantType === "legal" ? "Наименование:" : "ФИО:");
		$divHold.append($divHdr);
		$divHold.append($divDesc);
		$divHold.append($aEdit);
		$divHold.append($aDelete);
		$place.append($divHold);

		function buildEditBtn() {
			return $('<a/>')
				.attr("href", "javascript:void(0)")
				.attr("data-dialog-css-class", "dialog-participant dialog-participant-legal")
				.attr("data-dialog-load-url", PARTICIPANT_UTILS.serverUrl + "ajax/participant/" + PARTICIPANT_UTILS.participantType + "/edit/" + PARTICIPANT_UTILS.participantId)
				.attr("data-dialog-title", "Редактировать " + (PARTICIPANT_UTILS.participantType === "legal") ? "ЮЛ" : "ФЛ")
				.attr("data-dialog-request-action", "edit")
				.attr("style", "margin-left: 6px;")
				.addClass("btn-make-dialog normalized-text")
				.text("Редактировать");
		};
		function buildDeleteBtn() {
			return $('<a/>')
				.attr("href", "javascript:void(0)")
				.attr("data-participant-id", PARTICIPANT_UTILS.participantId)
				.attr("style", "margin-left: 4px;")
				.addClass("participant-delete")
				.text("Удалить");
		};
	},

	getParticipantFullName : function($participant) {
		var result = "";
		if (PARTICIPANT_UTILS.participantType === "legal") {
			result = $participant.find("#fullName").val();
		} else {
			result += $participant.find("#lastName").val();
			result += $participant.find("#firstName").val() === "" ? "" : " " + $participant.find("#firstName").val()[0] + ".";
			result += $participant.find("#middleName").val() === "" ? "" : " " + $participant.find("#middleName").val()[0] + ".";
		}
		return result;
	},

	buildPopoverRoleChanger() {
		return function () {
			var content = ['<a href="javascript:void(0)" class="col-sm-3 btn btn-in-form btn-aqua normalized-text change-role"', 
									'data-new-role="PLAINIFF">',
								'Истец',
							'</a>',
							'<a href="javascript:void(0)" class="col-sm-3 btn btn-in-form btn-aqua normalized-text change-role"', 
									'data-new-role="DEFENDANT">',
								'Ответчик',
							'</a>',
							'<a href="javascript:void(0)" class="col-sm-3 btn btn-in-form btn-aqua normalized-text change-role"', 
									'data-new-role="THIRD_PERSON">',
								'Третье лицо',
							'</a>'
						].join("")
			return content;
		}
	},

	dialogAdjustHeight() {
		if (DIALOG_INSTANCE.custom_role) {
			if (PARTICIPANT_UTILS.participantType === "legal") {
				PARTICIPANT_UTILS.$modalContent.height(PARTICIPANT_UTILS.heightModalLegalBase);
			} else {
				if ($("#isEntrepreneur").is(":checked")) {
					PARTICIPANT_UTILS.$modalContent.height(PARTICIPANT_UTILS.heightModalPhysicalBaseEnt);
					PARTICIPANT_UTILS.$entBlocks.show();
				} else {
					PARTICIPANT_UTILS.$modalContent.height(PARTICIPANT_UTILS.heightModalPhysicalBase);
				}
			}
			$(".role-field").hide();
			PARTICIPANT_UTILS.setCurrentRole(DIALOG_INSTANCE.custom_role);
		} else {
			if (PARTICIPANT_UTILS.participantType === "legal") {
				PARTICIPANT_UTILS.$modalContent.height(PARTICIPANT_UTILS.heightModalLegalHight);
			} else {
				if ($("#isEntrepreneur").is(":checked")) {
					PARTICIPANT_UTILS.$modalContent.height(PARTICIPANT_UTILS.heightModalPhysicalHightEnt);
					PARTICIPANT_UTILS.$entBlocks.show();
				} else {
					PARTICIPANT_UTILS.$modalContent.height(PARTICIPANT_UTILS.heightModalPhysicalHight);
				}
			}
		};
	},

	adjustEntBlock : function() {
		console.log($("#isEntrepreneur").is(":checked"));
		if ($("#isEntrepreneur").is(":checked")) {
			PARTICIPANT_UTILS.$modalContent.height($(".modal-content").height() + 80 + "px")
			PARTICIPANT_UTILS.$entBlocks.show();
		} else {
			PARTICIPANT_UTILS.$modalContent.height($(".modal-content").height() - 80 + "px")
			PARTICIPANT_UTILS.$entBlocks.hide();
		}
	}


}

IMAGE_UP_UTILS = {
	serverUrl : "",
	inProgress : false,
	allowedExt : [],
	imageMaxSize : 1*1024*1024,
	$mainForm : null,
	$sendImage : null,
	$imageForm : null,
	$fileInput : null,
	$fileInfo : null,
	$imageHolder : null,
	uploadUrl : "",
	litigLongId : "",
	imageType : 0,

	init : function(serverUrl, litigLongId, $mainForm, imageMaxSize, allowedExt, imageType) {
		IMAGE_UP_UTILS.serverUrl = serverUrl;
		IMAGE_UP_UTILS.litigLongId = litigLongId;
		IMAGE_UP_UTILS.imageMaxSize = imageMaxSize;
		IMAGE_UP_UTILS.allowedExt = allowedExt;
		IMAGE_UP_UTILS.$mainForm = $mainForm;
		IMAGE_UP_UTILS.imageType = imageType;
		IMAGE_UP_UTILS.$imageForm = $mainForm.find("#imageForm");
		IMAGE_UP_UTILS.$sendImage = $mainForm.find("#sendImage");
		IMAGE_UP_UTILS.$fileInput = $mainForm.find("#uploadImage");
		IMAGE_UP_UTILS.$fileInfo = $mainForm.find("#fileInfo");
		IMAGE_UP_UTILS.$imageHolder = $mainForm.find("#imageHolder");
		IMAGE_UP_UTILS.uploadUrl = IMAGE_UP_UTILS.serverUrl + "ajax/litigation/image";
	},

	addHendlers : function() {
		IMAGE_UP_UTILS.$mainForm
			.on('click', '#uploadPhotoLable', function(e) {
				e.preventDefault();
				IMAGE_UP_UTILS.$fileInput.click();
			}).on('change', '#uploadImage', function(e) {
				if (!IMAGE_UP_UTILS.isReadyToLoad()) return false;
				readURLAndPasteImage(this, IMAGE_UP_UTILS.$fileInput);
				IMAGE_UP_UTILS.$fileInfo.text(IMAGE_UP_UTILS.$fileInput.val().split("\\").pop());
			}).on('click', '#sendImage', function(e) {
				e.preventDefault();
				if (IMAGE_UP_UTILS.inProgress) return false;
				if (!IMAGE_UP_UTILS.isReadyToLoad()) return false;
				IMAGE_UP_UTILS.inProgress = true;
				var formData = new FormData(),
					imageName = IMAGE_UP_UTILS.$fileInput.val().split("\\").pop(),
					csrfObj = {
						token : $("meta[name='_csrf']").attr("content"),
						header : $("meta[name='_csrf_header']").attr("content")
					};
				formData.append('uploadImage', IMAGE_UP_UTILS.$fileInput[0].files[0]);
				formData.append('longId', IMAGE_UP_UTILS.litigLongId);
				formData.append('imageType', IMAGE_UP_UTILS.imageType);

				$.when(AJAXs.postFileWithFormData(csrfObj, formData, IMAGE_UP_UTILS.uploadUrl))
					.done(function(dataPhoto) {
						IMAGE_UP_UTILS.buildImageInfo(IMAGE_UP_UTILS.$imageHolder, dataPhoto.imageLongId, imageName);
						DIALOG_FORM.infoMessage(LANG_LOCAL.image_saved);
						IMAGE_UP_UTILS.$fileInfo.text("");
					}).fail(function(dataPhoto) {
						handlerAjaxFailWithAlertDialog(dataPhoto);
					}).always(function() {
						IMAGE_UP_UTILS.$sendImage.hide();
						IMAGE_UP_UTILS.inProgress = false;
					});
			})
	},

	isReadyToLoad : function() {
		return IMAGE_UP_UTILS.checkSelectedFile(IMAGE_UP_UTILS.$fileInput, IMAGE_UP_UTILS.$imageForm);
	},

	buildImageInfo : function($imageHolder, imageLongId, imageName) {
		var $divHold = $('<div/>').addClass("wp-data-row wp-data-row-litig").attr("id","image_" + imageLongId),
			$divDesc = $('<div/>').addClass("wp-data-info-desc normalized-text").text(imageName),
			$aShow = buildShowBtn(imageLongId),
			$aDel = buildDeleteBtn(imageLongId);

		$divHold.append($divDesc);
		$divHold.append($aShow);
		$divHold.append($aDel);
		$imageHolder.append($divHold);
		return true;

		function buildShowBtn(imageLongId) {
			return $('<a/>')
			.attr("href", IMAGE_UP_UTILS.serverUrl + "/image/litigation/" + imageLongId)
			.attr("target", "_blanc")
			.attr("style", "margin-left: 6px;")
			.text("Смотреть");
		};
		function buildDeleteBtn(imageLongId) {
			return $('<a/>')
				.attr("href", "javascript:void(0)")
				.attr("data-image-id", imageLongId)
				.attr("style", "margin-left: 4px;")
				.addClass("image-delete")
				.text("Удалить");
		};
	},

	deleteImage : function(imageLongId, $imageHolder) {
		var deleteObj = {
				title : LANG.confirmation,
				message : "Вы действительно желаете удалить файл?",
				btnConfirmAction : new goDelete(imageLongId, $imageHolder)
			}
		var confirmDialog = new DIALOG_FORM.DIALOG_BASE_CONFIRM(deleteObj);
		new BootstrapDialog.show(confirmDialog);

		function goDelete(imageLongId, $imageHolder) {
			var that = this;
			this.imageLongId = imageLongId;
			this.$imageHolder = $imageHolder;
			return function() {
				var url = IMAGE_UP_UTILS.serverUrl + 'ajax/litigation/image/' + that.imageLongId,
					csrfObj = {
						token : $("meta[name='_csrf']").attr("content"),
						header : $("meta[name='_csrf_header']").attr("content")
					};
				AJAXs.deleteWithCsrf(csrfObj, url)
					.done(function (data) {
						that.$imageHolder.detach();
						DIALOG_FORM.infoMessage(LANG_LOCAL.image_deleted);
					}).fail(function(data) {
						handlerAjaxFailWithAlertDialog(data);
					});
				}
		};
	},

	checkSelectedFile : function($el, $form) {
		var result = false;
		if (!$el.val()) {
			DIALOG_FORM.alertMessage("Файл не указан!");
		} else if (!isAllowedExt($el.val(), IMAGE_UP_UTILS.allowedExt)) {
			DIALOG_FORM.alertMessage(LANG_LOCAL.image_error_extension);
		} else if (!isImageContentType($el[0])) {
			DIALOG_FORM.alertMessage(LANG_LOCAL.image_error_content);
		} else if (!isAllowedFileSize($el[0], IMAGE_UP_UTILS.imageMaxSize)) {
			DIALOG_FORM.alertMessage(LANG_LOCAL.image_error_size);
		} else {
			result = true;
		}
		IMAGE_UP_UTILS.preUploadCheck($el, result);
		return result
	},

	preUploadCheck : function($el, result) {
		if (!result) {
			IMAGE_UP_UTILS.$sendImage.hide();
			$el.val(null);
			IMAGE_UP_UTILS.$fileInfo.text("");
		} else {
			IMAGE_UP_UTILS.$fileInfo.text(IMAGE_UP_UTILS.$fileInput.val().split("\\").pop());
			IMAGE_UP_UTILS.$sendImage.show();
		}
	}
}