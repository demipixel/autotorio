import * as factorioGenerators from 'factorio-generators';

export function blueprintTool(form: { [key: string]: any }) {
  var opt: { [key: string]: any } = {};
  Object.keys(form).forEach(function (key) {
    opt[key] = form[key];
  });

  opt.modifiedOnly = opt.modifiedOnly == 'on';

  ['entity', 'recipe', 'module'].forEach((replacer) => {
    var replacerOpt = opt[replacer + 'Replacer'];
    if (!replacerOpt) return;

    opt[replacer + 'Replace'] = [];
    replacerOpt.forEach(({ from, to }) => {
      if (!from || !to) return;

      var obj: { to: string; includes?: string; from?: string } = {
        to,
      };

      if (from.startsWith('includes:'))
        obj.includes = from.replace('includes:', '');
      else obj.from = from;

      opt[replacer + 'Replace'].push(obj);
    });
  });

  return factorioGenerators.blueprintTool(form.blueprint, opt);
}
