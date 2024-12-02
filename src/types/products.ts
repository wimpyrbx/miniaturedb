/**
 * @file products.ts
 * @description Type definitions for products, companies, lines and sets
 */

export interface Company {
  id: number;
  name: string;
}

export interface ProductLine {
  id: number;
  name: string;
  company_id: number;
}

export interface ProductSet {
  id: number;
  name: string;
  product_line_id: number;
}