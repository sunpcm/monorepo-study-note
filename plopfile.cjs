/**
 * Plop generators for this monorepo.
 *
 * Design goals:
 * - Keep new packages consistent (eslint/prettier/tsconfig wiring)
 * - Allow choosing destination: packages/ or packages/configs/ (or custom subdirs under packages/)
 * - Set @biu scope for all packages
 */

const path = require("node:path");
const { execSync } = require("node:child_process");

/**
 * Convert a user-provided name into a safe folder name.
 * - "@biu/foo-bar" -> "foo-bar"
 * - "foo-bar" -> "foo-bar"
 */
function toFolderName(raw) {
  const name = String(raw || "").trim();
  if (!name) return "";
  if (name.startsWith("@")) {
    const parts = name.split("/");
    return parts[1] || "";
  }
  return name;
}

/**
 * Ensure we always generate a scoped package name.
 * - "foo" -> "@biu/foo"
 * - "@biu/foo" -> "@biu/foo"
 */
function toScopedName(raw, scope) {
  const name = String(raw || "").trim();
  if (!name) return "";

  // 如果 name 已经带 @，直接返回
  if (name.startsWith("@")) return name;

  // 如果 scope 带了 @，先去掉（容错处理）
  const cleanScope = String(scope || "")
    .trim()
    .replace(/^@/, "");

  return `@${cleanScope}/${name}`;
}

module.exports = function (plop) {
  plop.setHelper("eq", (a, b) => a === b);

  // Format generated files to keep diffs clean.
  plop.setActionType("prettier", (answers, config) => {
    const rawFiles = config.files || [];
    if (!rawFiles.length) return "skipped";

    // Resolve handlebars placeholders (e.g. {{packageDir}}) using Plop's renderer.
    const files = rawFiles.map((f) => plop.renderString(String(f), answers));
    if (!files.length) return "skipped";

    execSync(`pnpm -w exec prettier --write ${files.map((f) => `"${f}"`).join(" ")}`, {
      stdio: "inherit",
    });
    return "formatted";
  });

  // Allow non-interactive mode via: plop package -- --name foo --kind lib --dir packages --react true
  // We read from process.argv.
  const argv = process.argv;
  const getArg = (key) => {
    const i = argv.indexOf(`--${key}`);
    if (i === -1) return undefined;
    const v = argv[i + 1];
    if (!v || v.startsWith("--")) return "true"; // boolean flag
    return v;
  };
  const cliDefaults = {
    scope: getArg("scope"),
    name: getArg("name"),
    kind: getArg("kind"),
    dir: getArg("dir"),
    react: (() => {
      const v = getArg("react");
      if (v === undefined) return undefined;
      return String(v).toLowerCase() === "true" ? "true" : "false";
    })(),
  };

  plop.setGenerator("package", {
    description: "Create a new workspace package (default @biu/*)",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Package name (without @biu/, e.g. my-utils):",
        default: cliDefaults.name,
        validate: (v) => (String(v || "").trim() ? true : "Package name is required"),
      },
      {
        type: "list",
        name: "kind",
        message: "Package kind:",
        choices: [
          { name: "lib (TS library)", value: "lib" },
          { name: "config (packages/configs/*)", value: "config" },
        ],
        default: cliDefaults.kind || "lib",
      },
      {
        type: "input",
        name: "subdir",
        message: "Subdirectory under packages/ (leave blank for packages/ or packages/configs/):",
        default: cliDefaults.dir || "",
      },
      {
        type: "list",
        name: "react",
        message: "Include React peerDependencies?",
        choices: [
          { name: "No", value: "false" },
          { name: "Yes", value: "true" },
        ],
        default: cliDefaults.react === undefined ? "false" : cliDefaults.react,
      },
    ],
    actions: function (answers) {
      const scope = "biu"; // 固定为 @biu
      const react = answers.react === true || answers.react === "true";
      const nameWithScope = toScopedName(answers.name, scope);
      const folderName = toFolderName(nameWithScope);

      // 如果用户填了 subdir，就拼接到 packages/ 后面；否则根据 kind 决定
      const defaultSubdir = answers.kind === "config" ? "configs" : "";
      const subdir = String(answers.subdir || "").trim() || defaultSubdir;
      const baseDir = subdir ? `packages/${subdir}` : "packages";
      const packageDir = path.posix.join(baseDir, folderName);

      // Make derived values available to later actions (especially custom ones).
      answers.packageDir = packageDir;
      answers.folderName = folderName;
      answers.nameWithScope = nameWithScope;

      return [
        {
          type: "add",
          path: "{{packageDir}}/package.json",
          templateFile: "plop-templates/package/package.json.hbs",
          data: {
            nameWithScope: nameWithScope,
            folderName,
            packageDir,
            kind: answers.kind,
            react,
          },
        },
        {
          type: "add",
          path: "{{packageDir}}/tsconfig.json",
          templateFile: "plop-templates/package/tsconfig.json.hbs",
          skipIfExists: true,
          data: { packageDir, kind: answers.kind },
        },
        {
          type: "add",
          path: "{{packageDir}}/src/index.ts",
          templateFile: "plop-templates/package/src-index.ts.hbs",
          skipIfExists: true,
          data: { packageDir },
        },
        {
          type: "add",
          path: "{{packageDir}}/README.md",
          templateFile: "plop-templates/package/README.md.hbs",
          skipIfExists: true,
          data: {
            name: nameWithScope,
            packageDir,
          },
        },
        {
          type: "prettier",
          files: [
            "{{packageDir}}/package.json",
            "{{packageDir}}/tsconfig.json",
            "{{packageDir}}/src/index.ts",
            "{{packageDir}}/README.md",
          ],
        },
      ];
    },
  });
};
