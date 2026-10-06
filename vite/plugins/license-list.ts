import {
  mkdir,
  readFile,
  readdir,
  realpath,
  writeFile,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type LicenseInfo = string | { type?: string; url?: string };
type PackageManifest = {
  name?: string;
  version?: string;
  license?: LicenseInfo | LicenseInfo[];
  licenses?: LicenseInfo[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

type ResolvedViteConfig = {
  build: { ssr?: boolean | string | string[] };
};

type PendingDependency = {
  name: string;
  fromDirectory: string;
  optional: boolean;
};

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const licenseFileName = /^(?:license|licence|copying|notice)(?:[._ -].*)?$/i;

function formatLicense(
  value: PackageManifest["license"] | PackageManifest["licenses"],
) {
  const licenses = Array.isArray(value) ? value : value ? [value] : [];
  return (
    licenses
      .map((license) =>
        typeof license === "string"
          ? license
          : (license.type ?? license.url ?? "Unknown"),
      )
      .join(" OR ") || "Not specified"
  );
}

async function resolvePackageDirectory(
  name: string,
  fromDirectory: string,
): Promise<string | undefined> {
  const packagePath = name.split("/");
  let directory = fromDirectory;

  while (true) {
    try {
      return await realpath(join(directory, "node_modules", ...packagePath));
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code !== "ENOENT" &&
        error.code !== "ENOTDIR"
      ) {
        throw error;
      }
    }

    const parent = dirname(directory);
    if (parent === directory) return undefined;
    directory = parent;
  }
}

async function readLicenseFiles(packageDirectory: string) {
  const entries = await readdir(packageDirectory, { withFileTypes: true });
  return Promise.all(
    entries
      .filter((entry) => entry.isFile() && licenseFileName.test(entry.name))
      .map(async (entry) => ({
        name: entry.name,
        text: (
          await readFile(join(packageDirectory, entry.name), "utf8")
        ).trimEnd(),
      })),
  );
}

async function createLicenseList() {
  const rootManifest = JSON.parse(
    await readFile(join(projectRoot, "package.json"), "utf8"),
  ) as PackageManifest;
  const pending: PendingDependency[] = [
    ...Object.keys(rootManifest.dependencies ?? {}).map((name) => ({
      name,
      fromDirectory: projectRoot,
      optional: false,
    })),
    ...Object.keys(rootManifest.devDependencies ?? {}).map((name) => ({
      name,
      fromDirectory: projectRoot,
      optional: false,
    })),
    ...Object.keys(rootManifest.optionalDependencies ?? {}).map((name) => ({
      name,
      fromDirectory: projectRoot,
      optional: true,
    })),
  ];
  const visited = new Set<string>();
  const packages = new Map<
    string,
    {
      name: string;
      version: string;
      license: string;
      files: { name: string; text: string }[];
    }
  >();

  for (let index = 0; index < pending.length; index += 1) {
    const dependency = pending[index]!;
    const packageDirectory = await resolvePackageDirectory(
      dependency.name,
      dependency.fromDirectory,
    );

    if (!packageDirectory) {
      if (dependency.optional) continue;
      throw new Error(`Unable to find dependency package: ${dependency.name}`);
    }
    if (visited.has(packageDirectory)) continue;
    visited.add(packageDirectory);

    const manifest = JSON.parse(
      await readFile(join(packageDirectory, "package.json"), "utf8"),
    ) as PackageManifest;
    const name = manifest.name ?? dependency.name;
    const version = manifest.version ?? "unknown";
    packages.set(`${name}@${version}`, {
      name,
      version,
      license: formatLicense(manifest.license ?? manifest.licenses),
      files: await readLicenseFiles(packageDirectory),
    });

    for (const packageName of Object.keys(manifest.dependencies ?? {})) {
      pending.push({
        name: packageName,
        fromDirectory: packageDirectory,
        optional: false,
      });
    }
    for (const packageName of [
      ...Object.keys(manifest.optionalDependencies ?? {}),
      ...Object.keys(manifest.peerDependencies ?? {}),
    ]) {
      pending.push({
        name: packageName,
        fromDirectory: packageDirectory,
        optional: true,
      });
    }
  }

  const entries = [...packages.values()].sort(
    (left, right) =>
      left.name.localeCompare(right.name) ||
      left.version.localeCompare(right.version),
  );
  const sections = entries.map(({ name, version, license, files }) =>
    [
      `=== ${name}@${version} ===`,
      `License: ${license}`,
      "",
      ...(files.length
        ? files.flatMap(({ name: fileName, text }) => [
            `--- ${fileName} ---`,
            text,
            "",
          ])
        : ["No license file found in the package.", ""]),
    ].join("\n"),
  );

  return [
    "Third-party dependency licenses",
    "",
    "Generated from package.json dependencies and devDependencies.",
    "Each entry includes available license and notice files.",
    `${entries.length} packages`,
    "",
    ...sections,
  ].join("\n");
}

export function dependencyLicenseListPlugin() {
  return {
    name: "dependency-license-list",
    async configResolved(config: ResolvedViteConfig) {
      if (config.build.ssr) return;

      const publicDirectory = join(projectRoot, "public");
      await mkdir(publicDirectory, { recursive: true });
      const output = await createLicenseList();
      await writeFile(join(publicDirectory, "licenses.txt"), output);
    },
  };
}
