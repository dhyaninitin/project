import { HttpErrorResponse } from '@angular/common/http';
import * as _ from 'underscore';

export function formatResposne(
  result: Array<any>,
  filter: any,
  search_fields: Array<string>
) {
  if (filter.search && filter.search.trim() && search_fields.length) {
    result = _.filter(result, item => {
      let pass = false;
      search_fields.forEach(field => {
        pass =
          pass ||
          (item[field] &&
            item[field]
              .toLowerCase()
              .includes(filter.search.trim().toLocaleLowerCase()));
      });
      return pass;
    });
  }

  const offset = (filter.page - 1) * filter.per_page,
    last_page = Math.floor(result.length / filter.per_page) + 1;
  const meta = {
    current_page: filter.page,
    from: offset,
    last_page,
    path: '',
    per_page: filter.per_page,
    to: offset + filter.per_page,
    total: result.length,
  };
  result = result.slice(meta.from, meta.to);
  let no = offset;
  result = _.map(result, item => {
    return {
      no: ++no,
      ...item,
    };
  });
  return {
    data: result,
    filter: filter,
    meta: meta,
  };
}

export function formatErrorMessage(
  err: HttpErrorResponse,
  customMessage: String
) {
  if (err.status === 422) {
    const errors = err.error.errors;
    return errors[Object.keys(errors)[0]][0];
  } else {
    return customMessage;
  }
}
