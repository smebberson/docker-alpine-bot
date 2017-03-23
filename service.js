'use strict';

const url = require('url')
const semver = require('semver')
const { send } = require('micro')

/**
 * Pre-qualify the incoming request.
 * @param  {Function} next A function to call when we have a valid request.
 * @return {Void}
 */
const missingRoutes = (next) => (req, res) => {

    // Handle favicon.ico requests.
    if (req.url === '/favicon.ico') {
        return send(res, 404)
    }

    if (req.url === '/') {
        return send(res, 200, '<script>window.location="https://github.com/smebberson/docker-alpine-bot";</script>');
    }

    return next(req, res)

}

/**
 * Validate an incoming request to make sure we have a valid image name and version.
 * @param  {String} image   Should be only 'alpine-nodejs'.
 * @param  {String} version Should be valid semver
 * @return {void}
 */
const validate = (image, version) => {

    // Make sure `image` is 'alpine-nodejs' only.
    if (image.toLowerCase() !== 'alpine-nodejs') {
        throw new Error(`The image '${image}' is not supported. Only the alpine-nodejs image is supported.`)
    }

    // Make sure `version` is valid semver.
    if (!semver.valid(semver.clean(version))) {
        throw new Error(`The version '${version}' is not valid semver.`)
    }

}

/**
 * Route handler.
 * @param  {Object} req The request object.
 * @param  {Object} res The response object.
 * @return {void}
 */
module.exports = missingRoutes((req, res) => {

    let statusCode = 200

    // We want to support the format `/{image}/{version}`.
    // {image} must be 'alpine-nodejs'.
    // {version} must be a valid semver string.

    const [, image, version] = url.parse(req.url).pathname.split('/')

    // Validate incoming data.
    validate(image, version)

    // Easy references.
    req.image = image
    req.version = version

    return send(res, statusCode, { image: req.image, version: req.version })

})
