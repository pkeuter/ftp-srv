const when = require('when');

module.exports = function ({log, command} = {}) {
  if (!this.fs) return this.reply(550, 'File system not instantiated');
  if (!this.fs.read) return this.reply(402, 'Not supported by file system');

  let dataSocket;
  return this.connector.waitForConnection()
  .then(socket => {
    this.commandSocket.pause();
    dataSocket = socket;
  })
  .then(() => when(this.fs.read(command._[1])))
  .then(stream => {
    return when.promise((resolve, reject) => {
      dataSocket.on('error', err => stream.emit('error', err));

      stream.on('data', data => dataSocket.write(data, this.encoding));
      stream.on('end', () => resolve(this.reply(226)));
      stream.on('error', err => reject(err));
      this.reply(150).then(() => dataSocket.resume());
    });
  })
  .catch(when.TimeoutError, err => {
    log.error(err);
    return this.reply(425, 'No connection established');
  })
  .catch(err => {
    log.error(err);
    return this.reply(551);
  })
  .finally(() => {
    this.connector.end();
    this.commandSocket.resume();
  });
}