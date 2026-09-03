export const paginate = (req, search: string[] = []) => {
    let { page, limit, keyword } = req.query;
    const pageDefault = 1;
    const limitDefault = 20;

    page = Number(page) || pageDefault;
    limit = Number(limit) || limitDefault;

    if (page < 1) {
        page = pageDefault;
    }
    if (limit < 1) {
        limit = limitDefault;
    }

    const index = (page - 1) * limit;

    const key = typeof keyword === 'string' && keyword.trim() !== '';
    const where = key && search.length > 0 ? {
        OR: search.map((field) => ({
            [field]: {contains: keyword},
        })),
    } : {};

    return {
        page,
        limit,
        index,
        where,
    };
}