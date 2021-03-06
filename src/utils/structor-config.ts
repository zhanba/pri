import * as _ from "lodash"
import * as path from "path"
import { IProjectConfig } from "./project-config-interface"

export const srcPath = {
  dir: "src"
}

export const tempPath = {
  dir: ".temp"
}

export const testsPath = {
  dir: "tests"
}

export const tsBuiltPath = {
  dir: "built"
}

export const pagesPath = {
  dir: path.join(srcPath.dir, `pages`)
}

export const notFoundPath = {
  dir: pagesPath.dir,
  name: "404",
  ext: ".tsx"
}

export const tempJsEntryPath = {
  dir: tempPath.dir,
  name: "entry",
  ext: ".tsx"
}

export const tempJsAppPath = { dir: tempPath.dir, name: "app", ext: ".tsx" }

export const utilPath = {
  dir: path.join(srcPath.dir, "utils")
}

export const helperPath = {
  dir: utilPath.dir,
  name: "helper",
  ext: ".tsx"
}

export const declarePath = {
  dir: path.join(tempPath.dir, "declare")
}

export const layoutPath = {
  dir: path.join(srcPath.dir, `layouts`),
  name: "index",
  ext: ".tsx"
}

export const markdownLayoutPath = {
  dir: layoutPath.dir,
  name: "markdown",
  ext: ".tsx"
}

export const storesPath = {
  dir: path.join(srcPath.dir, `stores`)
}

export const configPath = { dir: "config" }

export const configPaths = {
  default: {
    dir: configPath.dir,
    name: "config.default",
    ext: ".ts"
  },
  local: {
    dir: configPath.dir,
    name: "config.local",
    ext: ".ts"
  },
  prod: {
    dir: configPath.dir,
    name: "config.prod",
    ext: ".ts"
  }
}

export const markdownTempPath = {
  dir: path.join(tempPath.dir, "markdowns")
}

export const getGitignores = (projectConfig?: IProjectConfig) => {
  const ignores = [
    "node_modules",
    ".cache",
    ".vscode",
    tempPath.dir,
    tsBuiltPath.dir,
    ".DS_Store",
    "coverage",
    ".nyc_output"
  ]

  if (projectConfig) {
    // distDir.dir can be a/b/c
    const trimedDistDir = _.trimEnd(projectConfig.distDir, "/")
    const distPaths = trimedDistDir.split("/")

    distPaths.reduce((prev, current) => {
      if (prev === "") {
        ignores.push(current)
        return current
      } else {
        prev += "/" + current
        ignores.push(prev)
        return prev
      }
    }, "")
  }

  return ignores
}

export const getNpmignores = (projectConfig: IProjectConfig) => {
  const npmIgnores = getGitignores(projectConfig)
  npmIgnores.push(testsPath.dir)

  const builtPathIndex = npmIgnores.findIndex(name => name === tsBuiltPath.dir)
  npmIgnores.splice(builtPathIndex, 1)

  return npmIgnores
}

export const ignoreScanSources = [
  ".gitignore",
  ".npmignore",
  ".prettierrc",
  ".git",
  "package-lock.json",
  "package.json",
  "tsconfig.json",
  "tslint.json"
]
