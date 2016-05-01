/* */ 
(function(process) {
  var fs = require("fs");
  var path = require("path");
  module.exports = function(yargs, usage) {
    var self = {completionKey: 'get-yargs-completions'};
    self.getCompletion = function(done) {
      var completions = [];
      var current = process.argv[process.argv.length - 1];
      var previous = process.argv.slice(process.argv.indexOf('--' + self.completionKey) + 1);
      var argv = yargs.parse(previous);
      if (completionFunction) {
        if (completionFunction.length < 3) {
          var result = completionFunction(current, argv);
          if (typeof result.then === 'function') {
            return result.then(function(list) {
              process.nextTick(function() {
                done(list);
              });
            }).catch(function(err) {
              process.nextTick(function() {
                throw err;
              });
            });
          }
          return done(result);
        } else {
          return completionFunction(current, argv, function(completions) {
            done(completions);
          });
        }
      }
      var handlers = yargs.getCommandHandlers();
      for (var i = 0,
          ii = previous.length; i < ii; ++i) {
        if (handlers[previous[i]]) {
          return handlers[previous[i]](yargs.reset());
        }
      }
      if (!current.match(/^-/)) {
        usage.getCommands().forEach(function(command) {
          if (previous.indexOf(command[0]) === -1) {
            completions.push(command[0]);
          }
        });
      }
      if (current.match(/^-/)) {
        Object.keys(yargs.getOptions().key).forEach(function(key) {
          completions.push('--' + key);
        });
      }
      done(completions);
    };
    self.generateCompletionScript = function($0) {
      var script = fs.readFileSync(path.resolve(__dirname, '../completion.sh.hbs'), 'utf-8');
      var name = path.basename($0);
      if ($0.match(/\.js$/))
        $0 = './' + $0;
      script = script.replace(/{{app_name}}/g, name);
      return script.replace(/{{app_path}}/g, $0);
    };
    var completionFunction = null;
    self.registerFunction = function(fn) {
      completionFunction = fn;
    };
    return self;
  };
})(require("process"));
