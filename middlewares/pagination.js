module.exports = function paginate(req, totalPages, currentPage) {
  const generateHref = (request, page) => {
    const { query } = request;
    query.page = page;

    const qs = Object.entries(query).reduce(
      (queryString, keyValue, index, srcArr) => `${queryString}${keyValue[0]}=${keyValue[1]}${index < srcArr.length - 1 ? '&' : ''}`,
      '?',
    );

    return `${req.baseUrl}${qs}`;
  };

  let prevPage = '';
  let nextPage = generateHref(req, currentPage + 1);

  if (currentPage > 1) {
    prevPage = generateHref(req, currentPage - 1);
  }

  if (currentPage >= totalPages) {
    nextPage = '';
  }

  return {
    prevPage,
    nextPage,
  };
};
