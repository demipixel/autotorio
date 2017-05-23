
function submitForm(form) {
  try {
    if ($('.error-block:visible').length > 0 || !$('#blueprint').val()) {
      BootstrapDialog.show({
        type: BootstrapDialog.TYPE_DANGER,
        title: 'Error',
        message: !$('#blueprint').val() ? 'You must provide a blueprint string!' : 'You need to fix some errors!',
      });
    } else {
      var dataArray = $(form).serializeArray();
      var data = {};

      dataArray.forEach(function(datum) {
        data[datum.name] = datum.value;
      });
      
      FORM_DATA.forEach(function(element) {
        if (element.type == 'div') {
          if (outputReplacer(element.name)) data[element.name] = outputReplacer(element.name);
        }
      });

      BootstrapDialog.show({
        title: 'Blueprint String',
        message: 'Loading...',
        onshow: function(dialog) {
          var str = '';
          var err = false;
          try {
            str = generator(data);
          } catch (e) {
            str = 'Error: ' + e.message;
            err = true;
          }
          ga('send', 'event', 'request', document.location.pathname.slice(1), err ? 'fail' : 'success');
          dialog.getModalBody().html('<textarea class="form-control" rows=10>'+str+'</textarea>');
        },
        onshown: function(dialog) {
          dialog.getModalBody().find('textarea').select();
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
      if (element.type != 'div') {
        $e = $('#'+element.name);
        if ($e.val()) url += element.name+'='+encodeURI($e.val())+'&';
      } else {
        if (outputReplacer(element.name).length) url += element.name+'='+encodeURI(outputReplacer(element.name))+'&';
      }
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

  var activators = {};

  $trainDirection = $('#trainDirection');
  $trainDirection.change(function() {
    if ($trainDirection.val() == 'Top' || $trainDirection.val() == 'Bottom') {
      $('#minedOreDirection option').show();
      $('#minedOreDirection').val("Right").find('option[value=Top],[value=Bottom]').hide();
    } else if ($trainDirection.val() == 'Left' || $trainDirection.val() == 'Right') {
      $('#minedOreDirection option').show();
      $('#minedOreDirection').val("Bottom").find('option[value=Left],[value=Right]').hide();
    }
  });

  FORM_DATA.forEach(function(element) {
    if (getUrlParameter(element.name)){
      if (element.type != 'div') $('#'+element.name).val(getUrlParameter(element.name));
      else loadReplacer(element.name, $('#'+element.name).data('replacer'), getUrlParameter(element.name));
    }
    if (element.checkbox && getUrlParameter(element.checkbox.name)) $('#'+element.checkbox.name).prop('checked', getUrlParameter(element.checkbox.name) == 'true');

    if (element.checkbox && element.checkbox.activator) {
      activators[element.checkbox.activator] = element.checkbox.checked;
      $('#'+element.checkbox.name).change(function() {
        var isChecked = $('#'+element.checkbox.name).is(':checked');
        activators[element.checkbox.activator] = isChecked;
        if (isChecked) {
          var notActivators = Object.keys(activators).map(function(key) {
            return !activators[key] ? '.'+key : '.not-'+key;
          }).join(',');
          $('.'+element.checkbox.activator).not(notActivators).slideDown();
          $('.not-'+element.checkbox.activator).slideUp();
        } else {
          $('.'+element.checkbox.activator).slideUp();
          $('.not-'+element.checkbox.activator).slideDown();
        }
      });
    }

    if (element.activate) {
      if (!activators[element.activate]) $('.'+element.activate).hide();
      else $('.not-'+element.activate).hide();
    }

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