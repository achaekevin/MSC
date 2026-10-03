export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

export const generateUniqueSlug = async (
  baseText: string,
  checkExistsFn: (candidateSlug: string) => Promise<boolean>
): Promise<string> => {
  const baseSlug = slugify(baseText) || 'item';
  let candidateSlug = baseSlug;
  let counter = 1;

  while (await checkExistsFn(candidateSlug)) {
    counter += 1;
    candidateSlug = `${baseSlug}-${counter}`;
  }

  return candidateSlug;
};
