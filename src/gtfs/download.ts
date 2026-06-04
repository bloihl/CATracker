import { Platform } from 'react-native';
import type { ProgressCallback, CsvFilesMap } from './types';

export interface DownloadOptions {
  feedKey: string;
  url: string;
  onProgress?: ProgressCallback;
}

/**
 * Download a GTFS zip and extract relevant CSV files into memory as strings.
 * - Mobile (iOS/Android): react-native-fs + react-native-zip-archive
 * - Web: fetch + fflate (pure JS)
 */
export async function downloadAndExtract({ feedKey, url, onProgress }: DownloadOptions): Promise<CsvFilesMap> {
  if (Platform.OS === 'web') {
    return await downloadAndExtractWeb({ feedKey, url, onProgress });
  }
  return await downloadAndExtractNative({ feedKey, url, onProgress });
}

// ---------------- WEB -----------------
async function downloadAndExtractWeb({ url, onProgress }: DownloadOptions): Promise<CsvFilesMap> {
  onProgress?.({ phase: 'download', message: 'Downloading feed…' });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  const buf = await res.arrayBuffer();

  onProgress?.({ phase: 'unzip', message: 'Unzipping…' });
  // Lazy import fflate to avoid bundling on native
  const { unzipSync } = await import('fflate');
  const bytes = new Uint8Array(buf);
  const files = unzipSync(bytes);

  const out: CsvFilesMap = {};
  for (const [name, data] of Object.entries(files)) {
    if (!name.toLowerCase().endsWith('.txt')) continue; // GTFS CSV files are *.txt
    // Convert Uint8Array → string assuming UTF-8
    const text = new TextDecoder('utf-8').decode(data as Uint8Array);
    out[name] = text;
  }
  onProgress?.({ phase: 'unzip', message: 'Unzip complete', current: Object.keys(out).length });
  return out;
}

// ---------------- NATIVE -----------------
async function downloadAndExtractNative({ feedKey, url, onProgress }: DownloadOptions): Promise<CsvFilesMap> {
  // Lazy imports to avoid bundling these on web
  const RNFS = await import('react-native-fs');
  const ZipArchive = await import('react-native-zip-archive');

  const baseDir =  RNFS.default.CachesDirectoryPath;
  const workDir = `${baseDir}/gtfs_${feedKey}`;
  const zipPath = `${workDir}/feed.zip`;
  const extractDir = `${workDir}/unzipped`;

  // Ensure working directories exist and are clean
  await safeRemoveDir(RNFS.default, workDir);
  await RNFS.default.mkdir(workDir);

  onProgress?.({ phase: 'download', message: 'Downloading feed…' });
  await RNFS.default.downloadFile({ fromUrl: url, toFile: zipPath }).promise;

  const st = await RNFS.default.stat(zipPath);
  if (!st || Number(st.size) < 2048) {
    throw new Error(`Downloaded zip too small: ${st?.size ?? 0}`);
  }

  onProgress?.({ phase: 'unzip', message: 'Unzipping…' });
  await ZipArchive.unzip(zipPath, extractDir);

  // Read all .txt files into memory as strings
  const entries = await RNFS.default.readDir(extractDir);
  const out: CsvFilesMap = {};
  for (const e of entries) {
    if (!e.isFile() || !e.name?.toLowerCase().endsWith('.txt')) continue;
    const content = await RNFS.default.readFile(e.path, 'utf8');
    out[e.name] = content;
  }
  onProgress?.({ phase: 'unzip', message: 'Unzip complete', current: Object.keys(out).length });

  // Best-effort cleanup of the zip to save space; keep extracted csvs for reuse
  await safeRemoveFile(RNFS.default, zipPath);

  return out;
}

async function safeRemoveDir(RNFS: any, path: string) {
  try { const exists = await RNFS.exists(path); if (exists) await RNFS.unlink(path); } catch {}
}
async function safeRemoveFile(RNFS: any, path: string) {
  try { const exists = await RNFS.exists(path); if (exists) await RNFS.unlink(path); } catch {}
}
