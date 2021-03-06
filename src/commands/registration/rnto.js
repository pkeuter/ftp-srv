const when = require('when');

module.exports = {
  directive: 'RNTO',
  handler: function ({log, command} = {}) {
    if (!this.renameFrom) return this.reply(503);

    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.rename) return this.reply(402, 'Not supported by file system');

    const from = this.renameFrom;
    const to = command.arg;

    return when.try(this.fs.rename.bind(this.fs), from, to)
    .then(() => {
      return this.reply(250);
    })
    .catch(err => {
      log.error(err);
      return this.reply(550, err.message);
    })
    .finally(() => {
      delete this.renameFrom;
    });
  },
  syntax: '{{cmd}} <name>',
  description: 'Rename to'
};
