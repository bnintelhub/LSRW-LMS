/** Future backend base. Stubs ignore this today. */
export const API_BASE = "";

export async function apiGet<T>(local: () => T): Promise<T> {
  return local();
}

export async function apiMutate<T>(local: () => T): Promise<T> {
  return local();
}
