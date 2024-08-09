import { MediaType } from '~/constants/enum'

export interface Media {
  url: string
  type: MediaType
}

export interface LookupStageAggregationsType {
  from: string
  localField: string
  foreignField: string
  as: string
}

export interface ProjecttionStageAggregationsType {
  [key: string]: number
}
