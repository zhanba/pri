import * as fs from "fs-extra"
import * as _ from "lodash"
import * as path from "path"
import * as prettier from "prettier"
import { pri } from "../../node"
import { IProjectConfig } from "../../utils/project-config-interface"
import { declarePath, getGitignores, pagesPath, tsBuiltPath } from "../../utils/structor-config"

export function ensureDeclares(projectRootPath: string) {
  const declareAbsolutePath = path.join(projectRootPath, declarePath.dir)
  fs.copySync(path.join(__dirname, "../../../declare"), declareAbsolutePath)
}

export const ensurePrettierrc = (projectRootPath: string) => ({
  fileName: ".prettierrc",
  pipeContent: () =>
    JSON.stringify(
      {
        bracketSpacing: true,
        printWidth: 120,
        proseWrap: "never",
        requirePragma: false,
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: "none",
        useTabs: false,
        overrides: [{ files: "*.json", options: { printWidth: 200 } }]
      },
      null,
      2
    ) + "\n"
})

export const ensureTsconfig = (projectRootPath: string) => ({
  fileName: "tsconfig.json",
  pipeContent: () =>
    JSON.stringify(
      {
        compilerOptions: {
          module: "esnext",
          moduleResolution: "node",
          strict: true,
          strictNullChecks: false,
          jsx: "react",
          target: "esnext",
          experimentalDecorators: true,
          skipLibCheck: true,
          outDir: tsBuiltPath.dir,
          rootDir: "./", // Make sure ./src structor. # https://github.com/Microsoft/TypeScript/issues/5134
          lib: ["dom", "es5", "es6", "scripthost"]
        },
        include: [".temp/**/*", "src/**/*", "config/**/*", "tests/**/*"],
        exclude: ["node_modules", tsBuiltPath.dir, "lib"]
      },
      null,
      2
    ) + "\n"
})

export const ensureTslint = (projectRootPath: string) => ({
  fileName: "tslint.json",
  pipeContent: () =>
    JSON.stringify(
      {
        extends: ["tslint:latest", "tslint-config-prettier"],
        defaultSeverity: "error",
        rules: {
          "object-literal-sort-keys": false,
          "max-classes-per-file": [true, 5],
          "trailing-comma": [false],
          "no-string-literal": false,
          "arrow-parens": false,
          "no-var-requires": false,
          "prefer-conditional-expression": false,
          "no-implicit-dependencies": false,
          "no-object-literal-type-assertion": false,
          "no-submodule-imports": false,
          "no-empty": false
        }
      },
      null,
      2
    ) + "\n"
})

export const ensureVscode = (projectRootPath: string) => ({
  fileName: ".vscode/settings.json",
  pipeContent: () =>
    JSON.stringify(
      {
        "editor.formatOnPaste": true,
        "editor.formatOnType": true,
        "editor.formatOnSave": true,
        "typescript.tsdk": "node_modules/typescript/lib"
      },
      null,
      2
    ) + "\n"
})

export const ensureGitignore = (projectConfig: IProjectConfig) => ({
  fileName: ".gitignore",
  pipeContent: () =>
    getGitignores(projectConfig)
      .map(name => `/${name}`)
      .join("\n")
})

export default async (instance: typeof pri) => {
  const projectRootPath = instance.project.getProjectRootPath()
  const projectConfig = instance.project.getProjectConfig("local")

  instance.project.addProjectFiles(ensureGitignore(projectConfig))

  instance.project.addProjectFiles(ensureTsconfig(projectRootPath))

  instance.project.addProjectFiles(ensureVscode(projectRootPath))

  instance.project.addProjectFiles(ensurePrettierrc(projectRootPath))

  instance.project.addProjectFiles(ensureTslint(projectRootPath))

  ensureDeclares(projectRootPath)

  const homePagePath = path.join(pagesPath.dir, "index.tsx")
  const homePageAbsolutePath = path.join(projectRootPath, homePagePath)
  const homeMarkdownPagePath = path.join(pagesPath.dir, "index.md")
  const homeMarkdownPageAbsolutePath = path.join(projectRootPath, homeMarkdownPagePath)
  if (!fs.existsSync(homePageAbsolutePath) && !fs.existsSync(homeMarkdownPageAbsolutePath)) {
    instance.project.addProjectFiles({
      fileName: homePagePath,
      pipeContent: () =>
        prettier.format(
          `
      import { env } from "pri/client"
      import * as React from "react"

      class Props {

      }

      class State {

      }

      export default class Page extends React.PureComponent<Props, State> {
        public static defaultProps = new Props()
        public state = new State()

        public render() {
          return (
            <div>
              <h1 style={{ display: "flex", alignItems: "center", justifyContent: "center"}}>
                Welcome to pri!
              </h1>
              <p style={{ padding: "10 50px" }}>
                Current env: {env.isLocal && "local"}{env.isProd && "prod"}
              </p>
            </div>
          )
        }
      }
    `,
          { semi: true, singleQuote: true, parser: "typescript" }
        )
    })
  }

  instance.project.addProjectFiles({
    fileName: "package.json",
    pipeContent: prev => {
      const prevJson = JSON.parse(prev)
      return (
        JSON.stringify(
          _.merge({}, prevJson, {
            scripts: {
              start: "pri",
              build: "pri build",
              preview: "pri preview",
              analyse: "pri analyse",
              test: "pri test"
            }
          }),
          null,
          2
        ) + "\n"
      )
    }
  })

  instance.project.addProjectFiles({
    fileName: "tests/index.ts",
    pipeContent: () =>
      prettier.format(
        `
      import test from "ava"

      test("Example", t => {
        t.true(true)
      })
    `,
        { semi: true, singleQuote: true, parser: "typescript" }
      )
  })
}
