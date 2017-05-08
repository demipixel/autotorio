
function createReplacer(elementId, selectionName, custom) {
  var options = OPTIONS[selectionName].map(function(opt) {
    return '<option value="'+opt+'">'+opt.split('-').map(function(word) { return word[0].toUpperCase() + word.slice(1); }).join(' ')+'</option>'
  }).join('');

  console.log(options);

  var div = '<div class="replacer col-md-12">'
  for (var i = 0; i < 2; i++) {
    div += '<div class="col-md-3">';

    if (!custom) div += '<select class="selectpicker" data-live-search="true">'+options+'</select>';
    else div += '<input class="form-control" placeholder="example_item_name">';

    div += '</div>';
    if (i == 0) {
      div += '<div class="col-md-1" style="text-align: center">'
      div += '<span aria-hidden="true" class="fa fa-arrow-right fa-2x" style="position: relative; top: 5px; color: #333; margin-left: 20px"></span>'
      div += '</div>';
    }
  }
  div += '<div class="col-md-5">';
  div += '<button type="button" onClick="$(this).parent().slideUp(400,function() { $(this).remove() })" class="btn btn-danger" style="margin-left: 10px"><span aria-hidden="true" class="fa fa-times"></span> Remove</button>';
  div += '</div><hr></div>';

  $div = $(div).appendTo('#'+elementId);
  $div.find('option').each(function() {
    var content = '<img style="width:24px;height:24px" src="/assets/img/factorio-icons/'+(OPTIONS.map[$(this).text()] || $(this).text().toLowerCase().split(' ').join('-'))+'.png"> '+$(this).text();
    $(this).data('content', content);
  });
  $div.find('.selectpicker').selectpicker();
  $div.hide().slideDown();

  return $div;
}

function loadReplacer(elementId, selectionName, values) {
  var replacers = values.split(' ').map(function(replacer) { return replacer.split(','); });

  replacers.forEach(function(replacer) {
    createReplacer(elementId, selectionName).find('.selectpicker').each(function(index) {
      $(this).selectpicker('val', replacer[index]);
    });
  });
}