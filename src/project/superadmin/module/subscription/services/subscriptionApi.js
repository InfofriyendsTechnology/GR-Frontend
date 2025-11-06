import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';
import { companyApi } from '../../company/services/companyApi';

export const subscriptionApi = createApi({
    reducerPath: 'subscriptionApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Subscription'],
    endpoints: (builder) => ({
        getSubscriptions: builder.query({
            query: () => '/subscriptions',
            providesTags: ['Subscription'],
        }),
        getSubscriptionById: builder.query({
            query: (id) => `/subscriptions/${id}`,
            providesTags: ['Subscription'],
        }),
        createSubscription: builder.mutation({
            query: (data) => ({
                url: '/subscriptions',
                method: 'POST',
                body: data,
            }),
            async onQueryStarted(data, { dispatch, queryFulfilled }) {
                // Optimistically update the subscriptions list
                const subscriptionPatch = dispatch(
                    subscriptionApi.util.updateQueryData('getSubscriptions', undefined, (draft) => {
                        if (Array.isArray(draft?.data)) {
                            draft.data.push({
                                id: 'temp_' + Date.now(),
                                ...data
                            });
                        }
                    })
                );

                // Optimistically update the company's payment status
                const companyPatch = dispatch(
                    companyApi.util.updateQueryData('getCompanies', undefined, (draft) => {
                        if (Array.isArray(draft?.data)) {
                            const company = draft.data.find(c => c.id === data.companyId);
                            if (company) {
                                company.paymentStatus = data.status;
                            }
                        }
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    // If the creation fails, revert both optimistic updates
                    subscriptionPatch.undo();
                    companyPatch.undo();
                }
            },
            invalidatesTags: ['Subscription'],
        }),
        updateSubscription: builder.mutation({
            query: ({ id, data }) => ({
                url: `/subscriptions/${id}`,
                method: 'PUT',
                body: data,
            }),
            async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
                // Optimistically update the subscription
                const subscriptionPatch = dispatch(
                    subscriptionApi.util.updateQueryData('getSubscriptions', undefined, (draft) => {
                        if (Array.isArray(draft?.data)) {
                            const subscription = draft.data.find(s => s.id === id);
                            if (subscription) {
                                Object.assign(subscription, data);
                            }
                        }
                    })
                );

                // Optimistically update the company's payment status
                const companyPatch = dispatch(
                    companyApi.util.updateQueryData('getCompanies', undefined, (draft) => {
                        if (Array.isArray(draft?.data)) {
                            const company = draft.data.find(c => c.id === data.companyId);
                            if (company) {
                                company.paymentStatus = data.status;
                            }
                        }
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    // If the update fails, revert both optimistic updates
                    subscriptionPatch.undo();
                    companyPatch.undo();
                }
            },
            invalidatesTags: ['Subscription'],
        }),
        deleteSubscription: builder.mutation({
            query: (id) => ({
                url: `/subscriptions/${id}`,
                method: 'DELETE',
            }),
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                // Get the subscription data before deletion to find the company
                let companyId = null;
                let companyData = null;
                
                // Find the subscription to get the company ID
                const subscription = dispatch(
                    subscriptionApi.util.selectInvalidatedBy(
                        { type: 'Subscription' }
                    )
                ).reduce((acc, { originalArgs, data }) => {
                    if (data?.data) {
                        const sub = data.data.find(s => s.id === id);
                        if (sub) return sub;
                    }
                    return acc;
                }, null);
                
                if (subscription) {
                    companyId = subscription.companyId;
                    
                    // Find the company data
                    const companyState = dispatch(
                        companyApi.util.selectInvalidatedBy(
                            { type: 'Company', id: 'LIST' }
                        )
                    ).reduce((acc, { originalArgs, data }) => {
                        if (data?.data) {
                            const company = data.data.find(c => c.id === companyId);
                            if (company) return company;
                        }
                        return acc;
                    }, null);
                    
                    if (companyState) {
                        companyData = { ...companyState };
                    }
                }
                
                // Optimistically update the UI for subscription
                const subscriptionPatchResult = dispatch(
                    subscriptionApi.util.updateQueryData('getSubscriptions', undefined, (draft) => {
                        if (Array.isArray(draft?.data)) {
                            draft.data = draft.data.filter(subscription => subscription.id !== id);
                        }
                    })
                );
                
                // If we found the company, update its status to inactive
                let companyPatchResult = null;
                if (companyId && companyData) {
                    companyPatchResult = dispatch(
                        companyApi.util.updateQueryData('getCompanies', undefined, (draft) => {
                            if (Array.isArray(draft?.data)) {
                                const company = draft.data.find(c => c.id === companyId);
                                if (company) {
                                    company.status = 'inactive';
                                    company.paymentStatus = 'unpaid';
                                }
                            }
                        })
                    );
                }
                
                try {
                    const result = await queryFulfilled;
                    
                    // After successful deletion, update the company to inactive
                    if (companyId && companyData) {
                        try {
                            await dispatch(
                                companyApi.endpoints.updateCompany.initiate({
                                    id: companyId,
                                    data: {
                                        ...companyData,
                                        status: 'inactive',
                                        paymentStatus: 'unpaid'
                                    }
                                })
                            ).unwrap();
                        } catch (error) {
                            console.error('Failed to update company status:', error);
                        }
                    }
                    
                    return result;
                } catch (error) {
                    // If the deletion fails, revert the optimistic updates
                    subscriptionPatchResult.undo();
                    if (companyPatchResult) companyPatchResult.undo();
                    throw error;
                }
            },
            invalidatesTags: ['Subscription', 'Company'],
        }),
    }),
}); 

export const {
    useGetSubscriptionsQuery,
    useGetSubscriptionByIdQuery,
    useCreateSubscriptionMutation,
    useUpdateSubscriptionMutation,
    useDeleteSubscriptionMutation,
} = subscriptionApi;
