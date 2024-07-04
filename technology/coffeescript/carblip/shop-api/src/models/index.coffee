fs = require 'fs'
path = require 'path'
_ = require('underscore')
Sequelize = require("sequelize")

module.exports = (@sequelize,@wagner) ->

  @models = {}
  excludeFiles = [
    "index.coffee",
    "index.js"
  ]
  fs
  .readdirSync __dirname
  .filter (file) =>
    return (file.indexOf(".") != 0) && excludeFiles.indexOf(file) < 0
  .forEach (file) =>
    try
      model = require(path.join(__dirname, file))(@sequelize, Sequelize.DataTypes)
      @models[model.name] = model
    catch err
      console.log "Failed to load " + model + ": ", err
      console.log err.message


  Object.keys(@models).forEach (modelName) =>
    if ("associateRelations" of @models[modelName])
      @models[modelName].associateRelations(@models)

  # To ensure DRY-ness, register factories in a loop
  _.each @models, (value, key) =>
    @wagner.factory key,() =>
      return value

  return @models
