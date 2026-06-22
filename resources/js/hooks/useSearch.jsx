import { router } from "@inertiajs/react";

export default function useSearch(routeName, queryParams = {}) {
    return (field, value) => {
        const params = { ...queryParams };

        if (value?.trim()) {
            params[field] = value;
        } else {
            delete params[field];
        }

        delete params.page;

        router.get(route(routeName, params));
    };
}
