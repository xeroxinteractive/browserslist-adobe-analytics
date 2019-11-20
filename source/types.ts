import { JWTAuthConfig } from '@adobe/jwt-auth';

export interface BaseOptions extends Omit<JWTAuthConfig, 'metaScopes'> {
  rsid: string;
  globalId: string;
}

export interface WriteOptions extends BaseOptions {
  cwd?: string;
  filename?: string;
}

export interface RankedReportData {
  totalPages: number;
  firstPage: boolean;
  lastPage: boolean;
  numberOfElements: number;
  number: number;
  totalElements: number;
  message?: string;
  request?: object;
  columns: RankedColumnMetaData;
  rows: Row[];
  summaryData: RankedSummaryData;
}

export interface RankedColumnMetaData {
  dimension: ReportDimension;
  columnIds: string[];
  columnErrors?: RankedColumnError[];
}

export interface ReportDimension {
  id: string;
  type: ReportDimensionType;
}

export enum ReportDimensionType {
  STRING = 'string',
}

export interface RankedColumnError {
  columnId: string;
  errorCode:
    | 'unauthorized_metric'
    | 'unauthorized_dimension'
    | 'unauthorized_dimension_global'
    | 'anomaly_detection_failure_unexpected_item_count'
    | 'anomaly_detection_failure_tsa_service'
    | 'not_enabled_metric'
    | 'not_enabled_dimension'
    | 'not_enabled_dimension_global';
  errorId: string;
  errorDescription: string;
}

export interface Row {
  itemId: string;
  value?: string;
  data: number[];
}

export interface RankedSummaryData {
  filteredTotals: number[];
  totals: number[];
  'col-max': number[];
  'col-min': number[];
}

/**
 * Thrown if node-fetch response status is not >= 200 < 300.
 */
export class ResponseError extends Error {
  public status: number;
  /**
   * Creates a new ResponseError instance.
   *
   * @param statusText - The message returned by the server.
   * @param status - The HTTP status code returned by the server.
   */
  public constructor(statusText: string, status: number) {
    super(`${statusText} (${status})`);
    this.status = status;
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
