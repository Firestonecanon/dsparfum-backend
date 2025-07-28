export async function compressData(data) {
  try {
    const jsonString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const bytes = encoder.encode(jsonString);
    const compressed = await compress(bytes);
    return btoa(String.fromCharCode.apply(null, compressed));
  } catch (err) {
    console.error('Erreur lors de la compression:', err);
    return null;
  }
}

export async function decompressData(compressedStr) {
  try {
    const bytes = new Uint8Array(atob(compressedStr).split('').map(c => c.charCodeAt(0)));
    const decompressed = await decompress(bytes);
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decompressed);
    return JSON.parse(jsonString);
  } catch (err) {
    console.error('Erreur lors de la décompression:', err);
    return null;
  }
}

async function compress(uint8Array) {
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  writer.write(uint8Array);
  writer.close();
  return new Response(cs.readable).arrayBuffer().then(b => new Uint8Array(b));
}

async function decompress(uint8Array) {
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(uint8Array);
  writer.close();
  return new Response(ds.readable).arrayBuffer().then(b => new Uint8Array(b));
}
