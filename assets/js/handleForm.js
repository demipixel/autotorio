
function submitForm(form) {
  try {
    if ($('.error-block:visible').length > 0 || !$('#blueprint').val()) {
      BootstrapDialog.show({
        type: BootstrapDialog.TYPE_DANGER,
        title: 'Error',
        message: !$('#blueprint').val() ? 'You must provide a blueprint string!' : 'You need to fix some errors!',
      });
    } else {
      var triedSelect = false;
      BootstrapDialog.show({
        title: 'Outpots Blueprint String',
        message: 'Loading...',
        onshow: function(dialog) {
          $.ajax({
            type: 'POST',
            url: '/outpost/string',
            data: $(form).serializeArray(),
            dataType: 'json',
            success: function(data) {
              console.log(data);
              dialog.getModalBody().html('<textarea class="form-control" rows=10>'+(data.error || data.string)+'</textarea>');
              if (triedSelect) dialog.getModalBody().find('textarea').select();
            },
            error: function(data) {
              console.log(data);
            }
          });
        },
        onshown: function(dialog) {
          dialog.getModalBody().find('textarea').select();
          triedSelect = true;
        }
      })
    }
  } catch (e) { console.log(e); }
}

function getSettingsURL() {
  var url = document.location.origin + document.location.pathname + '?';
  FORM_DATA.forEach(function(element) {
    if (element.name == 'blueprint') return;

    if (element.name) {
      $e = $('#'+element.name);
      if ($e.val()) url += element.name+'='+encodeURI($e.val())+'&';
    }

    if (element.checkbox) {
      $c = $('#'+element.checkbox.name);
      url += element.checkbox.name+'='+encodeURI($c.is(':checked'))+'&';
    }
  });
  url = url.slice(0, -1);

  BootstrapDialog.show({
    title: 'Custom Settings URL',
    message: '<input class="form-control" value="'+url+'">',
    onshown: function(dialog) {
      dialog.getModalBody().find('input').select();
    }
  });
}

$(document).ready(function() {
  $('#minedOreDirection').show().find('option[value=Left],[value=Right]').hide();

  $trainDirection = $('#trainDirection');
  $trainDirection.change(function() {
    if ($trainDirection.val() == 'Top' || $trainDirection.val() == 'Bottom') {
      $('#minedOreDirection option').show();
      $('#minedOreDirection').val("Right").find('option[value=Up],[value=Down]').hide();
    } else if ($trainDirection.val() == 'Left' || $trainDirection.val() == 'Right') {
      $('#minedOreDirection option').show();
      $('#minedOreDirection').val("Down").find('option[value=Left],[value=Right]').hide();
    }
  });

  FORM_DATA.forEach(function(element) {
    if (getUrlParameter(element.name)) $('#'+element.name).val(getUrlParameter(element.name));
    if (element.checkbox && getUrlParameter(element.checkbox.name)) $('#'+element.checkbox.name).prop('checked', getUrlParameter(element.checkbox.name) == 'true');

    if (element.checkbox && element.checkbox.activator) {
      $('#'+element.checkbox.name).change(function() {
        console.log('Eh?');
        if ($('#'+element.checkbox.name).is(':checked')) {
          $('.'+element.checkbox.activator).slideDown();
        } else {
          $('.'+element.checkbox.activator).slideUp();
        }
      });
    }

    if (element.activate) $('.'+element.activate).hide();

    if (element.type != 'input') return;

    $('#'+element.name).keyup(function() {
      var value = parseInt($(this).val());
      if ($(this).val() != '' && element.number && isNaN(value)) {
        $(this).parent().addClass('has-error')
          .find('.error-block').show().text('You must enter a number!');
      } else if ($(this).val != '' && element.number && ((element.minimum != undefined && value < element.minimum) || (element.maximum != undefined && value > element.maximum))) {
        $(this).parent().addClass('has-error').find('.error-block');
        var errorBlock = $(this).parent().find('.error-block').show();
        if (element.maximum != undefined && element.minimum != undefined) errorBlock.text('This number must be between '+element.minimum+' and '+element.maximum);
        else if (element.maximum != undefined) errorBlock.text('This number cannot be larger than '+element.maximum);
        else errorBlock.text('This number cannot be less than '+element.minimum);
      } else {
        $(this).parent().removeClass('has-error').find('.error-block').hide();
      }
    });
  });
});



function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
};