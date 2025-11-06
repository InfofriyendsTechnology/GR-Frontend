import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const inquiryApi = createApi({
    reducerPath: 'inquiryApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Inquiry'],
    endpoints: (builder) => ({
        // Get all inquiries
        getInquiries: builder.query({
            query: () => '/inquiries',
            providesTags: (result) =>
                result
                    ? [
                          ...result.data.map(({ id }) => ({ type: 'Inquiry', id })),
                          { type: 'Inquiry', id: 'LIST' },
                      ]
                    : [{ type: 'Inquiry', id: 'LIST' }]
        }),

        // Get inquiry by ID
        getInquiry: builder.query({
            query: (id) => `/inquiries/${id}`,
            providesTags: (result, error, id) => [{ type: 'Inquiry', id }]
        }),

        // Create inquiry
        createInquiry: builder.mutation({
            query: (data) => ({
                url: '/inquiries',
                method: 'POST',
                body: data
            }),
            invalidatesTags: [{ type: 'Inquiry', id: 'LIST' }]
        }),

        // Update inquiry
        updateInquiry: builder.mutation({
            query: ({ id, data }) => ({
                url: `/inquiries/${id}`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Inquiry', id },
                { type: 'Inquiry', id: 'LIST' }
            ]
        }),

        // Delete inquiry
        deleteInquiry: builder.mutation({
            query: (id) => ({
                url: `/inquiries/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Inquiry', id },
                { type: 'Inquiry', id: 'LIST' }
            ],
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                // Optimistically update the cache immediately
                const patchResult = dispatch(
                    inquiryApi.util.updateQueryData('getInquiries', undefined, (draft) => {
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
        })
    })
});

export const {
    useGetInquiriesQuery,
    useGetInquiryQuery,
    useCreateInquiryMutation,
    useUpdateInquiryMutation,
    useDeleteInquiryMutation
} = inquiryApi; 