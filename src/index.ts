import { extract as formatJSExtract } from '@formatjs/cli';
import FastGlob from 'fast-glob';
import path from 'path';
import fs from 'fs';

type FormattedMessage = {
  defaultMessage: string;
};

const extractMessages = async (glob: string): Promise<Record<string, string>> => {
  const files = FastGlob.sync(glob);
  const formattedMessages: Record<string, FormattedMessage> = JSON.parse(await formatJSExtract(files, {}));

  return Object.fromEntries(Object.entries(formattedMessages).map(([k, v]) => [k, v.defaultMessage]));
};

const readLangFile = async (locale: string, outDir: string): Promise<Record<string, string>> => {
  const filePath = path.resolve(outDir, `${locale}.json`);

  try {
    return JSON.parse(await fs.promises.readFile(filePath, { encoding: 'utf-8' }));
  } catch (err: any) {
    if (err.code === 'ENOENT') return {};
    throw err;
  }
};

const writeLang = async (locale: string, outDir: string, messages: Record<string, string>) => {
  const filePath = path.resolve(outDir, `${locale}.json`);

  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(filePath, JSON.stringify(messages, undefined, 2));
};

const updateLang = (messages: Record<string, string>, keys: string[]): Record<string, string> => {
  const newMessages: Record<string, string> = {};

  keys.forEach((k) => (newMessages[k] = messages[k] || ''));

  return newMessages;
};

export type ExtractOptions = {
  glob: string;
  outDir: string;
  locales: string[];
  defaultLocale: string;
};

export const extract = async ({ glob, outDir, locales, defaultLocale }: ExtractOptions) => {
  if (!locales.includes(defaultLocale)) throw new Error(`defaultLocale "${defaultLocale}" not found in locales array [${locales.join(', ')}]`);

  console.log('Extracting messages...');
  const extractedMessages = await extractMessages(glob);
  const keys = Object.keys(extractedMessages);

  console.log(keys.length ? `${keys.length} message${keys.length > 1 ? 's' : ''} found` : 'No message found');

  const langs = await Promise.all(locales.map((l) => readLangFile(l, outDir)));

  const newLangs = locales.map((l, index) => {
    if (l === defaultLocale) return extractedMessages;

    return updateLang(langs[index], keys);
  });

  await Promise.all(
    locales.map((l, index) => {
      const messages = newLangs[index];
      const missingTranslationsCount = Object.values(messages).filter((v) => v === '').length;
      if (missingTranslationsCount)
        console.log(`[INFO] ${missingTranslationsCount} missing translation${missingTranslationsCount > 1 ? 's' : ''} for locale '${l}'`);

      return writeLang(l, outDir, messages);
    })
  );

  console.log('Done')
};
