import { PAGINATION } from "../constants/index.js";

export const getPagination = (query = {}) => {
    const page = Math.max(Number(query.page) || PAGINATION.DEFAULT_PAGE, 1);
    const requestedLimit = Number(query.limit) || PAGINATION.DEFAULT_LIMIT;
    const limit = Math.min(Math.max(requestedLimit, 1), PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

export const buildPaginationMeta = ({ page, limit, total }) => ({
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
});
