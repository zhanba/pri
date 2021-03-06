import * as colors from "colors"
// tslint:disable-next-line:no-implicit-dependencies
import * as express from "express"
import * as fs from "fs"
import * as normalizePath from "normalize-path"
import * as open from "opn"
import * as path from "path"
import * as portfinder from "portfinder"
import * as url from "url"
import * as urlJoin from "url-join"
import * as webpack from "webpack"
import * as webpackDevServer from "webpack-dev-server"
import { tempPath } from "../utils/structor-config"
import { IProjectConfig } from "./project-config-interface"
import { compilerLogger } from "./webpack-compiler-log"
import { getWebpackConfig } from "./webpack-config"

interface IOptions {
  projectRootPath: string
  entryPath: string
  env: "local" | "prod"
  htmlTemplatePath: string
  devServerPort: number
  projectConfig: IProjectConfig
  publicPath: string
  distDir?: string
  outFileName?: string
  htmlTemplateArgs: {
    dashboardServerPort?: number
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

export const runWebpackDevServer = async (opts: IOptions) => {
  let webpackConfig = await getWebpackConfig({
    mode: "development",
    projectRootPath: opts.projectRootPath,
    entryPath: opts.entryPath,
    env: opts.env,
    htmlTemplatePath: opts.htmlTemplatePath,
    htmlTemplateArgs: opts.htmlTemplateArgs,
    projectConfig: opts.projectConfig,
    publicPath: opts.publicPath,
    distDir: opts.distDir,
    outFileName: opts.outFileName
  })

  if (opts.pipeConfig) {
    webpackConfig = opts.pipeConfig(webpackConfig)
  }

  webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())

  const webpackDevServerConfig: webpackDevServer.Configuration = {
    host: "127.0.0.1",
    hot: true,
    hotOnly: true,
    publicPath: opts.publicPath,
    before: app => {
      app.use("/static", express.static(path.join(opts.projectRootPath, tempPath.dir, "static")))
    },
    compress: true,
    historyApiFallback: { rewrites: [{ from: "/", to: normalizePath(path.join(opts.publicPath, "index.html")) }] },
    https: opts.projectConfig.useHttps,
    overlay: { warnings: true, errors: true },
    stats,
    watchOptions: { ignored: /node_modules/ },
    headers: { "Access-Control-Allow-Origin": "*" },
    clientLogLevel: "warning",
    disableHostCheck: true,
    port: opts.devServerPort
  }

  webpackDevServer.addDevServerEntrypoints(webpackConfig, webpackDevServerConfig)
  const compiler = webpack(webpackConfig)
  compilerLogger(compiler as any)

  const devServer = new webpackDevServer(compiler, webpackDevServerConfig)

  devServer.listen(opts.devServerPort, "127.0.0.1", () => {
    open(
      urlJoin(
        `${opts.projectConfig.useHttps ? "https" : "http"}://localhost:${opts.devServerPort}`,
        opts.projectConfig.baseHref
      )
    )
  })
}
