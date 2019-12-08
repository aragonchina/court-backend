#! /usr/bin/env node

const fs = require('fs')
const path = require('path')
const yargs = require('yargs')
const Logger = require('@aragon/court-backend-shared/helpers/logger')
const errorHandler = require('../src/helpers/errorHandler')

const DEFAULT_OPTIONS = {
  from: { alias: 'f', describe: 'Sender address', type: 'string' },
  network: { alias: 'n', describe: 'Network name', type: 'string', demand: true },
  silent: { describe: 'No logging', type: 'boolean', default: false },
  verbose: { describe: 'Verbose logging mode', type: 'boolean', default: false },
}

const commandsDir = path.resolve(__dirname, '../src/commands')
const commands = fs.readdirSync(commandsDir)

commands.forEach(commandFilename => {
  const command = require(path.resolve(commandsDir, commandFilename))

  command.builder = { ...command.builder, ...DEFAULT_OPTIONS }
  command.handler = argv => {
    const { silent, verbose } = argv
    Logger.setDefaults(silent, verbose)
    command.handlerAsync(argv).then(() => process.exit(0)).catch(errorHandler)
  }

  yargs.command(command)
})

yargs
  .help()
  .showHelpOnFail(true)
  .demandCommand(1, 'Please run any of the commands listed above')
  .strict()
  .argv