import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const planApi = createApi({
    reducerPath: 'planApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Plan'],
    endpoints: (builder) => ({
        getPlans: builder.query({
            query: () => ({
                url: '/plan',
                method: 'GET',
            }),
            transformResponse: (response) => {
                // Transform the response to handle the new fields
                if (response?.data) {
                    return {
                        ...response,
                        data: response.data.map(plan => ({
                            ...plan,
                            // Ensure the fields are properly typed
                            price: typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price,
                            trialDays: typeof plan.trialDays === 'string' ? parseInt(plan.trialDays) : plan.trialDays,
                            duration: typeof plan.duration === 'string' ? parseInt(plan.duration) : plan.duration,
                            isLifetime: typeof plan.isLifetime === 'string' ? plan.isLifetime === 'true' : Boolean(plan.isLifetime),
                            isTrial: typeof plan.isTrial === 'string' ? plan.isTrial === 'true' : Boolean(plan.isTrial),
                            isActive: typeof plan.isActive === 'string' ? plan.isActive === 'true' : Boolean(plan.isActive),
                        }))
                    };
                }
                return response;
            },
            providesTags: ['Plan'],
        }),
        getPlanById: builder.query({
            query: (id) => ({
                url: `/plan/${id}`,
                method: 'GET',
            }),
            transformResponse: (response) => {
                // Transform the response to handle the new fields
                if (response?.data) {
                    return {
                        ...response,
                        data: {
                            ...response.data,
                            // Ensure the fields are properly typed
                            price: typeof response.data.price === 'string' ? parseFloat(response.data.price) : response.data.price,
                            trialDays: typeof response.data.trialDays === 'string' ? parseInt(response.data.trialDays) : response.data.trialDays,
                            duration: typeof response.data.duration === 'string' ? parseInt(response.data.duration) : response.data.duration,
                            isLifetime: typeof response.data.isLifetime === 'string' ? response.data.isLifetime === 'true' : Boolean(response.data.isLifetime),
                            isTrial: typeof response.data.isTrial === 'string' ? response.data.isTrial === 'true' : Boolean(response.data.isTrial),
                            isActive: typeof response.data.isActive === 'string' ? response.data.isActive === 'true' : Boolean(response.data.isActive),
                        }
                    };
                }
                return response;
            },
            providesTags: ['Plan'],
        }),
        createPlan: builder.mutation({
            query: (data) => ({
                url: '/plan',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Plan'],
        }),
        updatePlan: builder.mutation({
            query: ({ id, data }) => ({
                url: `/plan/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Plan'],
        }),
        deletePlan: builder.mutation({
            query: (id) => ({
                url: `/plan/${id}`,
                method: 'DELETE',
            }),
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                // Optimistically update the UI
                const patchResult = dispatch(
                    planApi.util.updateQueryData('getPlans', undefined, (draft) => {
                        if (Array.isArray(draft)) {
                            return draft.filter(plan => plan.id !== id);
                        } else if (draft?.data) {
                            draft.data = draft.data.filter(plan => plan.id !== id);
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    // If the deletion fails, revert the optimistic update
                    patchResult.undo();
                }
            },
            invalidatesTags: ['Plan'],
        }),
    }),
});

export const {
    useGetPlansQuery,
    useGetPlanByIdQuery,
    useCreatePlanMutation,
    useUpdatePlanMutation,
    useDeletePlanMutation,
} = planApi; 