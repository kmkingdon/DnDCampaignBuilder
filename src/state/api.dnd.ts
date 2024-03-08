import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const dndApi = createApi({
  reducerPath: 'dndApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://www.dnd5eapi.co/api' }),
  endpoints: (builder) => ({
    getAlignment: builder.query<any, string>({
      query: (index) => `/alignments/${index}`,
    }),
    getRace: builder.query<any, string>({
      query: (index) => `/races/${index}`,
    }),
    getTrait: builder.query<any, string>({
        query: (index) => `/traits/${index}`,
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetAlignmentQuery, useGetRaceQuery } = dndApi