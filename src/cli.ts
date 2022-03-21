#!/usr/bin/env node

import { program } from 'commander';
import path from 'path';
import { extract } from '.';

const pkg = require('../package.json');
program.name(pkg.name).description(pkg.description).version(pkg.version);

type CLIOptions = {
  glob: string;
  defaultLocale: string;
  locales: string;
};

program
  .argument('<outDir>', 'The lang directory')
  .option('-l, --locales [locales]', 'The locales list', 'en')
  .option('-g, --glob [glob]', 'The glob describing files to process', 'src/**/!(*.test).*(js|jsx|ts|tsx)')
  .option('-d, --defaultLocale [locale]', 'The default locale used in code', 'en')
  .action(async (outDir: string, options: CLIOptions) => {
    const locales = options.locales.split(',');

    await extract({
      outDir: path.resolve(outDir),
      locales: locales,
      glob: options.glob,
      defaultLocale: options.defaultLocale,
    });

    process.exit(0);
  });

program.parse();
