type DynamicObject = Record<string, any>;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "*",
};

class QueryMarker {
  constructor() {}
  // https://stackoverflow.com/questions/1714786/query-string-encoding-of-a-javascript-object
  private serialize(obj: DynamicObject): string {
    const str = [];
    for (const p in obj)
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    return str.join("&");
  }
  // [['cookie', 'x-foo']] -> [["cookie", "x-foo"]]
  private parseHeaders(stringHeaders: string) {
    try {
      return JSON.parse(stringHeaders);
    } catch {
      try {
        return JSON.parse(stringHeaders.replace(/'/g, '"'));
      } catch {
        return {};
      }
    }
  }
  // [["cookie", "x-foo"]] -> { cookie: "x-foo" }
  private composeHeaders(arrayOfHeaders: [string, string][]) {
    const headers: DynamicObject = {};
    arrayOfHeaders.forEach((header: [string, string]) => {
      headers[header[0]] = header[1];
    });
    return headers;
  }

  private composeQuery(originalQuery: DynamicObject) {}

  private getHost = (url: string) => {
    return new URL(url).host;
  };
}
