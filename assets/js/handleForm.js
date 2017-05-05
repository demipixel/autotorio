
function submitForm(form) {
  try {
  if ($('.error-block:visible').length > 0) {
    BootstrapDialog.show({
      type: BootstrapDialog.TYPE_DANGER,
      title: 'Error',
      message: 'You need to fix some errors!',
    });
  } else {
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
            setTimeout(function() { dialog.getModalBody().find('textarea').select(); }, 450);
          },
          error: function(data) {
            console.log(data);
          }
        });
      }
    })
  }
  } catch (e) { console.log(e)}
}

$(document).ready(function() {
  $('#minedOreDirection').show().find('option[value=Left],[value=Right]').hide();

  $trainDirection = $('#trainDirection');
  $trainDirection.change(function() {
    console.log('Here', $trainDirection.val()== 'Top');
    if ($trainDirection.val() == 'Top' || $trainDirection.val() == 'Bottom') {
      $('#minedOreDirection option').show();
      $('#minedOreDirection').val("Right").find('option[value=Up],[value=Down]').hide();
    } else if ($trainDirection.val() == 'Left' || $trainDirection.val() == 'Right') {
      $('#minedOreDirection option').show();
      $('#minedOreDirection').val("Down").find('option[value=Left],[value=Right]').hide();
    }
  });

  FORM_DATA.forEach(function(element) {
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

