import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const reviewsApi = createApi({
    reducerPath: 'reviewsApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Reviews', 'UsedReviews', 'ReviewStats', 'ReviewLists', 'Company'],
    endpoints: (builder) => ({
        getReviews: builder.query({
            query: () => ({
                url: '/google-reviews',
                method: 'GET',
            }),
            providesTags: ['Reviews'],
        }),
        getReviewById: builder.query({
            query: (id) => ({
                url: `/google-reviews/${id}`,
                method: 'GET',
            }),
            providesTags: ['Reviews'],
        }),
        getCompanyGoogleReview: builder.query({
            query: (companyId) => ({
                url: `/google-reviews/company/${companyId}`,
                method: 'GET',
            }),
            providesTags: ['Reviews'],
        }),
        updateGoogleReviewIndex: builder.mutation({
            query: ({ companyId, index, review }) => ({
                url: `/google-reviews/company/${companyId}/${index}`,
                method: 'PUT',
                body: { review },
            }), 
            invalidatesTags: ['Reviews'],
        }),
        createReview: builder.mutation({
            query: (data) => ({
                url: '/google-reviews',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, data) => [
                'Reviews',
                { type: 'Company', id: data.companyId }
            ],
        }),
        updateReview: builder.mutation({
            query: ({ id, data }) => ({
                url: `/google-reviews/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { data }) => [
                'Reviews',
                { type: 'Company', id: data.companyId }
            ],
        }),
        deleteReview: builder.mutation({
            query: (id) => ({
                url: `/google-reviews/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Reviews'],
        }),
        getReviewList: builder.query({
            query: (reviewId) => ({
                url: `/review-lists/${reviewId}`,
                method: 'GET',
            }),
            providesTags: ['ReviewLists'],
        }),
        getUsedReviews: builder.query({
            query: (reviewId) => ({
                url: `/used-reviews/${reviewId}`,
                method: 'GET',
            }),
            providesTags: ['UsedReviews'],
        }),
        updateUsedReview: builder.mutation({
            query: ({ id, data }) => ({
                url: `/used-reviews/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Reviews', 'UsedReviews'],
        }),
        getReviewStats: builder.query({
            query: () => ({
                url: '/overview-reviews',
                method: 'GET',
            }),
            providesTags: ['ReviewStats'],
        }),
        getCompanyReviewStats: builder.query({
            query: (companyId) => ({
                url: `/overview-reviews/company/${companyId}`,
                method: 'GET',
            }),
            providesTags: ['ReviewStats'],
        }),
        bulkUploadReviews: builder.mutation({
            query: ({ companyId, reviews }) => ({
                url: `/review-lists/bulk-upload/${companyId}`,
                method: 'POST',
                body: reviews
            }),
            invalidatesTags: (result, error, { companyId }) => [
                { type: 'ReviewStats', id: companyId }
            ]
        })
    }),
});

export const {
    useGetReviewsQuery,
    useGetReviewByIdQuery,
    useGetCompanyGoogleReviewQuery,
    useCreateReviewMutation,
    useUpdateReviewMutation,
    useDeleteReviewMutation,
    useGetReviewListQuery,
    useGetUsedReviewsQuery,
    useUpdateUsedReviewMutation,
    useGetReviewStatsQuery,
    useGetCompanyReviewStatsQuery,
    useBulkUploadReviewsMutation,
    useUpdateGoogleReviewIndexMutation
} = reviewsApi; 