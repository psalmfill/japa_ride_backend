import { PaginationDto } from './dto/pagination.dto';

export const formatPagination = (data, paginate: PaginationDto) => {
  return {
    data,
    meta: {
      currentPage: +paginate.page,
      nextPage: +paginate.page + 1,
      previousPage: paginate.page - 1,
      pageSize: +paginate.pageSize,
    },
  };
};
