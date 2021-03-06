import getInstallerType from "./get-installer-type";

import ItchStorageSlot from "../itch-storage-slot";
import * as path from "path";

import Context from "../../context";

import { Logger } from "../../logger";

import {
  Cancelled,
  InstallerType,
  IQueueInstallOpts,
  IRuntime,
} from "../../types";
import { IGame } from "../../db/models/game";

export interface ICoreInstallOpts extends IQueueInstallOpts {
  /** for cancellations, accessing db, etc. */
  ctx: Context;

  /** the game we're installing/uninstalling */
  game: IGame;

  /** usually goes to a cave logger */
  logger: Logger;

  /** where to install the item */
  destPath: string;

  /** from what source to install the item */
  archivePath: string;

  /** the type of the installer */
  installerType?: InstallerType;

  /** which runtime to install for */
  runtime: IRuntime;

  /** if truthy, run as admin */
  elevated?: boolean;
}

type InstallOperation = "install" | "uninstall";

interface IInstallInfo {
  installerName: InstallerType;
}
const installInfoSlot = new ItchStorageSlot<IInstallInfo>("install-info");

export interface IInstallManager {
  install: (opts: ICoreInstallOpts) => Promise<void>;
  uninstall: (opts: ICoreInstallOpts) => Promise<void>;
}

interface IInstallManagers {
  [key: string]: IInstallManager;
}

import naked from "./naked";
import archive from "./archive";
import msi from "./msi";
import dmg from "./dmg";
import nsis from "./nsis";
import inno from "./inno";

const managers: IInstallManagers = {
  naked,
  archive,
  msi,
  dmg,
  nsis,
  inno,
};

export async function coreInstall(opts: ICoreInstallOpts) {
  return await coreOperate(opts, "install", null);
}

export async function coreUninstall(opts: ICoreInstallOpts) {
  return await coreOperate(opts, "uninstall", null);
}

export async function coreOperate(
  opts: ICoreInstallOpts,
  operation: InstallOperation,
  specifiedInstallerName?: InstallerType,
) {
  const { ctx, archivePath, runtime } = opts;
  const logger = opts.logger.child({ name: "install/core" });

  let source = "";
  let installerName: InstallerType;
  if (specifiedInstallerName) {
    source = "specified";
    installerName = specifiedInstallerName;
  } else {
    let info: IInstallInfo;
    // when reinstalling, we do want to sniff again
    if (opts.reason !== "reinstall") {
      await installInfoSlot.load(opts.destPath);
    }

    if (info) {
      installerName = info.installerName;
      source = "cached";
    } else {
      installerName = await getInstallerType({
        ctx,
        logger,
        target: archivePath,
        runtime,
      });
      source = "sniffed";
    }
  }

  logger.info(
    `using ${source} installer '${installerName}' for ${path.basename(
      archivePath,
    )}`,
  );

  const manager = managers[installerName];
  if (!manager) {
    logger.error(`No install manager found for '${installerName}'`);
    throw new Cancelled("no install manager found");
  }

  await installInfoSlot.save(opts.destPath, { installerName });
  await manager[operation](opts);

  if (opts.reason === "reinstall") {
    logger.info(`Was reinstall, clearing verdict`);
    ctx.db.saveOne("caves", opts.caveId, { verdict: null });
  }
}
