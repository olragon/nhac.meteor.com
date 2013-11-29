Package.describe({
  summary: "underscore.string repackaged for Meteor"
});

Package.on_use(function (api, where) {
  where = where || ['client', 'server'];
  api.use('underscore', where);

  api.add_files('lib/underscore.string/lib/underscore.string.js', where);
  api.add_files('common.js', where);

  if (api.imply) {
    api.imply('underscore');
  }
});
