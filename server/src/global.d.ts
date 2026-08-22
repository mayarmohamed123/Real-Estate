declare module "@terraformer/wkt" {
  export function wktToGeoJSON(wkt: string): object;
  export function geojsonToWKT(geojson: object): string;
  export function arcgisToGeoJSON(arcgis: object): object;
  export function geojsonToArcGIS(geojson: object): object;
}
