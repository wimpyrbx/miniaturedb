export interface TypeDistribution {
  type: string;
  count: number;
}

export interface LocationDistribution {
  location: string;
  count: number;
}

export interface CollectionGrowth {
  month: string;
  count: number;
}

export interface PaintedByDistribution {
  name: string;
  count: number;
}

export interface ProductLineDistribution {
  company: string;
  productLine: string;
  count: number;
}

export interface CompanyDistribution {
  name: string;
  count: number;
}

export interface SetDistribution {
  name: string;
  productLine: string;
  company: string;
  count: number;
}

export interface TagDistribution {
  text: string;
  value: number;
} 