import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const companyApi = createApi({
    reducerPath: 'companyApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Company'],
    endpoints: (builder) => ({
        // Get all companies
        getCompanies: builder.query({
            query: () => '/companies',
            providesTags: (result) =>
                result
                    ? [
                          ...result.data.map(({ id }) => ({ type: 'Company', id })),
                          { type: 'Company', id: 'LIST' },
                      ]
                    : [{ type: 'Company', id: 'LIST' }]
        }),

        // Get company by ID
        getCompany: builder.query({
            query: (id) => `/companies/${id}`,
            providesTags: (result, error, id) => [{ type: 'Company', id }]
        }),

        // Create company
        createCompany: builder.mutation({
            query: (data) => ({
                url: '/companies',
                method: 'POST',
                body: data
            }),
            invalidatesTags: [
                { type: 'Company', id: 'LIST' },
                'Reviews'
            ]
        }),

        // Update company
        updateCompany: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/companies/${id}`,
                method: 'PUT',
                body: data?.data
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Company', id },
                { type: 'Company', id: 'LIST' },
                'Reviews'
            ]
        }),

        // Delete company
        deleteCompany: builder.mutation({
            query: (id) => ({
                url: `/companies/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Company', id },
                { type: 'Company', id: 'LIST' },
                'Reviews'
            ],
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                // Optimistically update the cache immediately
                const patchResult = dispatch(
                    companyApi.util.updateQueryData('getCompanies', undefined, (draft) => {
                        if (draft?.data) {
                            draft.data = draft.data.filter(item => item.id !== id);
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    // If the deletion fails, undo the optimistic update
                    patchResult.undo();
                }
            }
        }),

        // Bulk create companies
        bulkCreateCompanies: builder.mutation({
            query: (data) => ({
                url: '/companies/bulk',
                method: 'POST',
                body: data
            }),
            invalidatesTags: [{ type: 'Company', id: 'LIST' }]
        })
    })
});

export const {
    useGetCompaniesQuery,
    useGetCompanyQuery,
    useCreateCompanyMutation,
    useUpdateCompanyMutation,
    useDeleteCompanyMutation,
    useBulkCreateCompaniesMutation
} = companyApi;