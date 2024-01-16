import {useEffect} from 'react';

async function DecompressBlob(blob) {
  const ds = new DecompressionStream("gzip");
  const decompressedStream = blob.stream().pipeThrough(ds);
  return await new Response(decompressedStream).blob();
}

function useGetLatestData(){
    useEffect(async () => {
        fetch("https://oregon-gtfs.trilliumtransit.com/gtfs_data/hoodriver-or-us/hoodriver-or-us.zip")
        .then((response) => await DecompressBlob(response.blob())
        .catch( error => {
          console.error(error);
        });
    }, []);
}

export default useGetLatestData;