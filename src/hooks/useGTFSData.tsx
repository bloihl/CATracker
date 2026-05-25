import { useState, useEffect } from 'react';
import RNFetchBlob from 'rn-fetch-blob';
import { unzip } from 'react-native-zip-archive';
import Papa from 'papaparse';

const GTFS_URL = 'https://oregon-gtfs.trilliumtransit.com/gtfs_data/hoodriver-or-us/hoodriver-or-us.zip';

interface GTFSData {
  routes?: any[];
  stops?: any[];
  trips?: any[];
}

interface UseGTFSDataOutput {
  data: GTFSData;
  loading: boolean;
  error: Error | null;
}

const useGTFSData = (): UseGTFSDataOutput => {
  const [data, setData] = useState<GTFSData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const dirs = RNFetchBlob.fs.dirs;
        const zipPath = `${dirs.DocumentDir}/gtfs.zip`;
        const unzipPath = `${dirs.DocumentDir}/gtfs_unzipped`;

        // Download the zip file
        const res = await RNFetchBlob.config({
          path: zipPath,
        }).fetch('GET', GTFS_URL);

        if (res.info().status !== 200) {
          throw new Error(`Failed to download GTFS data. Status: ${res.info().status}`);
        }

        // Unzip the file
        await RNFetchBlob.fs.mkdir(unzipPath); // Ensure the directory exists
        const unzippedPath = await unzip(zipPath, unzipPath);

        // Define which files to read
        const filesToRead = {
          routes: 'routes.txt',
          stops: 'stops.txt',
          trips: 'trips.txt',
        };

        const parsedData: GTFSData = {};

        for (const key in filesToRead) {
          const fileName = filesToRead[key as keyof typeof filesToRead];
          const filePath = `${unzipPath}/${fileName}`;

          // Check if file exists
          const fileExists = await RNFetchBlob.fs.exists(filePath);
          if (!fileExists) {
            console.warn(`File ${fileName} not found in zip.`);
            parsedData[key as keyof GTFSData] = [];
            continue;
          }

          const fileContent = await RNFetchBlob.fs.readFile(filePath, 'utf8');

          // Parse CSV data
          const parseResult = Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
          });

          if (parseResult.errors.length > 0) {
            console.warn(`Errors parsing ${fileName}:`, parseResult.errors);
          }
          parsedData[key as keyof GTFSData] = parseResult.data;
        }

        setData(parsedData);

      } catch (e) {
        if (e instanceof Error) {
          setError(e);
        } else {
          setError(new Error('An unknown error occurred during GTFS data processing.'));
        }
        console.error("Error in useGTFSData:", e);
      } finally {
        setLoading(false);
        // Optional: Clean up downloaded and unzipped files
        // RNFetchBlob.fs.unlink(zipPath).catch(console.error);
        // RNFetchBlob.fs.unlink(unzipPath).catch(console.error); // This deletes the directory
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export default useGTFSData;
