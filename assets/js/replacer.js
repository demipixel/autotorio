
function createReplacer(elementId, selectionName, custom) {
  var options = OPTIONS[selectionName].map(function(opt) {
    return '<option value="'+opt+'">'+opt.split('-').map(function(word) { return word[0].toUpperCase() + word.slice(1); }).join(' ')+'</option>'
  });

  var div = '<div class="replacer col-md-12">'
  for (var i = 0; i < 2; i++) {
    div += '<div class="col-md-3">';

    if (!custom) div += '<select class="selectpicker" data-live-search="true" data-size=10>'+options.filter(function(opt) { return i == 0 || opt.indexOf('includes:') == -1; }).join('')+'</select>';
    else div += '<input class="form-control" placeholder="example_item_name">';

    div += '</div>';
    if (i == 0) {
      div += '<div class="col-md-1" style="text-align: center">'
      div += '<span aria-hidden="true" class="fa fa-arrow-right fa-2x" style="position: relative; top: 5px; color: #333; margin-left: 20px"></span>'
      div += '</div>';
    }
  }
  div += '<div class="col-md-5">';
  div += '<button type="button" onClick="$(this).parent().parent().slideUp(400,function() { $(this).remove() })" class="btn btn-danger" style="margin-left: 10px"><span aria-hidden="true" class="fa fa-times"></span> Remove</button>';
  div += '</div><hr></div>';

  $div = $(div).appendTo('#'+elementId);
  $div.find('option').each(function() {
    var name = $(this).text().toLowerCase().split(' ').join('-');
    var content = '';
    if (name.indexOf('includes:') != 0) {
      content = '<img style="width:24px;height:24px" src="/assets/img/factorio-icons/'+name+'.png"> '+(OPTIONS.map[name] || $(this).text());
    } else {
      var possibleOpt = [];
      OPTIONS[selectionName].forEach(function(opt) {
        if (opt.indexOf('includes:') == -1 && opt.indexOf(name.replace('includes:', '')) > -1) possibleOpt.push(opt);
      });


      content += '<div style="display:inline-block; width: 32px">';
      for (var i = 0; i < Math.min(3, possibleOpt.length); i ++) {
        content += '<div style="position:relative;left:'+(-i*20)+';display:inline-block">';
        content += '<img style="width:24px;height:24px" src="/assets/img/factorio-icons/'+possibleOpt[i*Math.max(Math.floor(possibleOpt.length/3), 1)]+'.png">'
        content += '</div>';
      }
      content += '</div>';
      content += ' '+(OPTIONS.map[name] || $(this).text());
    }
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

function outputReplacer(elementId) {
  var ret = '';
  $('#'+elementId+' .replacer').each(function() {
    $(this).find('.selectpicker').each(function(i) {
      ret += (i != 0 ? ',' : '') + $(this).val();
    });
    ret += ' ';
  });
  return ret.trim();
}