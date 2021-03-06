var _ = require('lodash');
var Q = require('q');
var config = require('./config');

var publisher = {};

/**
 * Publishes artifacts.
 *
 * This general publisher will loop through
 * to all the "publish" blocks of a project
 * configuration and invoke the specific
 * publisher (ie. s3).
 *
 * We will wait untill all publishers are done
 * to declare ourselves done :)
 */
publisher.publish = function(dockerClient, buildId, project, logger, options) {
  if (project.publish) {
    logger.info("[%s] Publishing artifacts...", buildId);
    var publishers = [];

    _.each(project.publish, function(target){
      logger.info("[%s] Publishing to %s", buildId, target.to);
      var publisher_config = {}
      if (config.config.publisher && config.config.publisher.hasOwnProperty(target.to)) {
          publisher_config = config.config.publisher[target.to];
      }
      _.extend(target, publisher_config)
      publishers.push(require('./publisher/' + target.to)(dockerClient, buildId, project, logger, target));
    });

    return Q.all(publishers);
  } else {
    logger.info("[%s] Nothing to publish for this build", buildId);
    return Q.when();
  }
}

module.exports = publisher;
