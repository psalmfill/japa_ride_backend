import { randomUUID } from 'crypto';
import { extname } from 'path';
import { PaginationDto } from './dto/pagination.dto';

export const formatPagination = (response, paginate: PaginationDto) => {
  const [data, count] = response;

  return {
    data,
    meta: {
      total: count,
      currentPage: +paginate.page,
      nextPage: +paginate.page + 1,
      previousPage: paginate.page - 1,
      pageSize: +paginate.pageSize,
    },
  };
};

export const editFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = randomUUID();
  callback(null, `${randomName}${fileExtName}`);
};

export function getDistance(arg0: {
  pickupLongitude: number;
  pickupLatitude: number;
  pickupAddress: string;
  destinationLongitude: number;
  destinationAddress: string;
  destinationLatitude: number;
}): number | PromiseLike<number> {
  return 2;
}
