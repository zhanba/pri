import * as colors from "colors"
import * as fs from "fs"
import * as normalizePath from "normalize-path"
import * as open from "opn"
import * as path from "path"
import * as portfinder from "portfinder"
import * as webpack from "webpack"
import { tempPath } from "../utils/structor-config"
import { IProjectConfig } from "./project-config-interface"
import { compilerLogger } from "./webpack-compiler-log"
import { getWebpackConfig } from "./webpack-config"

interface IOptions {
  mode: "production" | "development"
  projectRootPath: string
  entryPath: string
  env: "local" | "prod"
  htmlTemplatePath?: string
  projectConfig: IProjectConfig
  publicPath?: string
  distDir?: string
  outFileName?: string
  outCssFileName?: string
  htmlTemplateArgs?: {
    dashboardServerPort?: number
    dashboardClientPort?: number
    libraryStaticPath?: string
  }
  pipeConfig?: (config?: webpack.Configuration) => webpack.Configuration
}

const stats = {
  warnings: false,
  version: false,
  modules: false,
  entrypoints: false,
  hash: false,
  colors: true,
  children: false
}

export const runWebpack = async (opts: IOptions): Promise<any> => {
  let webpackConfig = await getWebpackConfig({
    mode: opts.mode,
    projectRootPath: opts.projectRootPath,
    entryPath: opts.entryPath,
    env: opts.env,
    htmlTemplatePath: opts.htmlTemplatePath,
    htmlTemplateArgs: opts.htmlTemplateArgs,
    projectConfig: opts.projectConfig,
    publicPath: opts.publicPath,
    distDir: opts.distDir,
    outFileName: opts.outFileName,
    outCssFileName: opts.outCssFileName
  })

  if (opts.pipeConfig) {
    webpackConfig = opts.pipeConfig(webpackConfig)
  }

  const compiler = webpack(webpackConfig)
  compilerLogger(compiler as any)
  return runCompiler(compiler)
}

function runCompiler(compiler: webpack.Compiler) {
  return new Promise(resolve => {
    compiler.run((err, status) => {
      if (!err && !status.hasErrors()) {
        process.stdout.write(status.toString(stats) + "\n\n")

        resolve(status.toJson())
      } else {
        if (err && err.message) {
          throw Error(err.message)
        } else {
          throw Error(status.toString())
        }
      }
    })
  })
}
