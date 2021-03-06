import * as commander from "commander"
import { ICommand, plugin } from "../utils/plugins"

export interface IRegisterCommand {
  name?: string
  description?: string
  action?: any
  isDefault?: boolean
  options?: any[][]
}

export const registerCommand = (opts: IRegisterCommand) => {
  plugin.commands.push(opts)
}

interface IExpandCommand {
  name: string
  beforeAction?: any
  afterAction?: any
}

export const expandCommand = (opts: IExpandCommand) => {
  plugin.commands.push(opts)
}
