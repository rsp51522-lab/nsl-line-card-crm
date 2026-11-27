// Patch the current upstream bundle instead of replacing a build-specific chunk.
// Keeping its module IDs intact also preserves navigation after upstream updates.
export function addCardEstimatePrefill(source: string): string {
  return source.replace(
    /new URLSearchParams\(\{([^{}]*?)\}\)(?=,`https:\/\/rsp51522-lab\.github\.io\/nextsaleslab-demo\/\?)/g,
    (original, fields: string) => {
      const card = fields.match(/\bemail:([\w$]+)\.email\?\.trim\(\)\|\|""/)?.[1];
      if (!card) return original;
      const additions = [];
      if (!/\baddress:/.test(fields)) additions.push(`address:${card}.address?.trim()||""`);
      if (!/\bphone:/.test(fields)) additions.push(`phone:${card}.mobile?.trim()||${card}.phone?.trim()||""`);
      if (!additions.length) return original;
      return `new URLSearchParams({${fields},${additions.join(",")}})`;
    },
  );
}

export function refreshCardClientUrls(source: string): string {
  return source.replace(
    /(\/_next\/static\/chunks\/[\w-]+\.js)(\?)?/g,
    (_, path: string, query: string | undefined) => `${path}?nsl-prefill=20261127${query ? "&" : ""}`,
  );
}
